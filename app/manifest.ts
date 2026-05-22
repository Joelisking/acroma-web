import type { MetadataRoute } from "next";

// Web App Manifest — makes the dashboard installable to the home screen.
// Colors are the canonical brand hex (see CLAUDE.md §2); the manifest spec
// requires literal hex, so these are the one place raw hex is correct.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Acroma",
    short_name: "Acroma",
    description: "AI commerce, order management, and customer service for WhatsApp.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#1A2942",
    theme_color: "#F26F21",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
