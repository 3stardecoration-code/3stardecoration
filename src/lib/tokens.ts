export const tokens = {
  color: {
    ivory: "#f7f4ef",
    charcoal: "#14110f",
    accent: "#b08d57", // champagne gold — confirm vs. real logo (spec §15)
  },
  ease: {
    // shared GSAP/CSS easing
    lux: [0.16, 1, 0.3, 1] as const,
  },
} as const;
