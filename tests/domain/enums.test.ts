import { describe, it, expect } from "vitest";
import {
  workflowStatusSchema,
  projectStatusSchema,
  heroLayoutSchema,
  mediaSourceSchema,
} from "@/lib/domain/enums";

describe("domain enums", () => {
  it("workflow_status has draft/published/unpublished", () => {
    expect(workflowStatusSchema.options).toEqual(["draft", "published", "unpublished"]);
  });
  it("project_status has upcoming/ongoing/completed", () => {
    expect(projectStatusSchema.options).toEqual(["upcoming", "ongoing", "completed"]);
  });
  it("hero layout has the four variants", () => {
    expect(heroLayoutSchema.options).toEqual([
      "fullscreen_video",
      "fullscreen_image",
      "split",
      "carousel",
    ]);
  });
  it("media source has cloudinary + external providers", () => {
    expect(mediaSourceSchema.options).toEqual([
      "cloudinary_image",
      "cloudinary_video",
      "youtube",
      "vimeo",
    ]);
  });
});
