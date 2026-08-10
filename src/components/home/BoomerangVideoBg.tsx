"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

const CAPTURE_WIDTH = 720;
const MAX_FRAMES = 180;
const PLAYBACK_FPS = 30;

/**
 * Plays a source video once, capturing frames to offscreen canvases as it
 * goes, then switches to a canvas that ping-pongs (plays forward, then
 * reverse, forever) through the captured frames — a "boomerang" loop with no
 * hard cut, unlike a native video loop.
 */
export function BoomerangVideoBg({ src }: { src: string }) {
  const videoRef = useRef<VideoWithFrameCallback | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const skipRef = useRef(1);
  const frameCountRef = useRef(0);
  const lastCapturedTimeRef = useRef(-1);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let rafId = 0;
    let rvfcId = 0;

    function captureFrame() {
      if (cancelled || !video) return;
      const t = video.currentTime;
      if (t === lastCapturedTimeRef.current) return;
      lastCapturedTimeRef.current = t;
      frameCountRef.current += 1;
      if (frameCountRef.current % skipRef.current !== 0) return;
      if (framesRef.current.length >= MAX_FRAMES) return;

      const w = CAPTURE_WIDTH;
      const h = Math.round((video.videoHeight / (video.videoWidth || 1)) * w) || Math.round((w * 9) / 16);
      const frame = document.createElement("canvas");
      frame.width = w;
      frame.height = h;
      const ctx = frame.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      framesRef.current.push(frame);
    }

    function loop() {
      if (cancelled || !video) return;
      if (video.requestVideoFrameCallback) {
        rvfcId = video.requestVideoFrameCallback(() => {
          captureFrame();
          loop();
        });
      } else {
        rafId = requestAnimationFrame(() => {
          captureFrame();
          loop();
        });
      }
    }

    function handleLoadedMetadata() {
      if (!video) return;
      // Spread roughly MAX_FRAMES captures across the clip, assuming a ~27fps source.
      const estimatedSourceFrames = video.duration * 27;
      skipRef.current = Math.max(1, Math.round(estimatedSourceFrames / MAX_FRAMES));
    }

    function handleEnded() {
      cancelled = true;
      if (rvfcId && video?.cancelVideoFrameCallback) video.cancelVideoFrameCallback(rvfcId);
      if (rafId) cancelAnimationFrame(rafId);
      if (framesRef.current.length > 1) setReady(true);
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.play().then(loop).catch(() => {});

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let index = 0;
    let direction = 1;
    let raf = 0;
    let last = 0;
    const interval = 1000 / PLAYBACK_FPS;

    function draw(time: number) {
      if (time - last >= interval) {
        last = time;
        const frame = frames[index];
        if (canvas && frame) {
          canvas.width = frame.width;
          canvas.height = frame.height;
          ctx?.drawImage(frame, 0, 0);
        }
        if (index >= frames.length - 1) direction = -1;
        else if (index <= 0) direction = 1;
        index += direction;
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 origin-top scale-[1.08]">
        {!reduced && (
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            autoPlay
            className="h-full w-full object-cover object-top"
            style={{ display: ready ? "none" : "block" }}
          />
        )}
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover object-top"
          style={{ display: ready && !reduced ? "block" : "none" }}
        />
        {reduced && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/demo-assets/hero-01.jpg" alt="" className="h-full w-full object-cover object-top" />
        )}
      </div>
    </div>
  );
}
