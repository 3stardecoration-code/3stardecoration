# Demo assets — TEMPORARY

These images are **temporary demonstration content only** — they are **not** the
client's work. They exist so the site can be presented as a production-ready,
premium demo before the real portfolio is uploaded.

- **Source:** royalty-free photography from [Unsplash](https://unsplash.com)
  (free to use under the [Unsplash License](https://unsplash.com/license)).
- **Theme:** luxury weddings, receptions, stage/mandap decoration, floral
  setups, and corporate events — chosen to match the premium brand direction.
- **Format:** event photos are 1600×1067 (3:2); hero images are 2400×1350 (16:9).

## How these get replaced (no code change)

The mock data layer (`src/lib/services/mock/fixtures.ts`) points `MediaAsset.secure_url`
at `/demo-assets/*.jpg`. When the client's real images/videos are uploaded through
the **Media Library** (Cloudinary) and the Supabase adapter is wired in
(`src/lib/services/provider.ts`), these fixtures are replaced entirely. UI
components read `secure_url` / `width` / `height` / `dominant_color` from the
domain model — never a hard-coded path — so swapping in real content requires
**no layout or markup changes**. See `docs/architecture-service-seam.md`.

Once real content is live, this folder can be deleted.
