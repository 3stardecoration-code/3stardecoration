import { describe, it, expect, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "threestar");
});

describe("cloudinaryLoader", () => {
  it("builds a transformed delivery URL for a public id", async () => {
    const { default: loader } = await import("@/lib/cloudinary-loader");
    const url = loader({ src: "portfolio/wedding1", width: 800, quality: 70 });
    expect(url).toBe(
      "https://res.cloudinary.com/threestar/image/upload/f_auto,q_70,w_800/portfolio/wedding1"
    );
  });
  it("defaults quality to auto", async () => {
    const { default: loader } = await import("@/lib/cloudinary-loader");
    const url = loader({ src: "portfolio/wedding1", width: 400 });
    expect(url).toContain("q_auto");
  });
  it("passes through absolute non-Cloudinary URLs (e.g. YouTube thumbnails)", async () => {
    const { default: loader } = await import("@/lib/cloudinary-loader");
    const src = "https://i.ytimg.com/vi/abc/hqdefault.jpg";
    expect(loader({ src, width: 400 })).toBe(src);
  });
  it("passes through root-relative local paths (e.g. /public assets, mock fixtures)", async () => {
    const { default: loader } = await import("@/lib/cloudinary-loader");
    const src = "/demo/wedding-1.jpg";
    expect(loader({ src, width: 400 })).toBe(src);
  });
});
