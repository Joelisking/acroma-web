import type { ReactNode } from "react";

// Matches http(s) URLs so we can render them as clickable links. Location pins
// arrive as message content (and inside delivery addresses) with a Google Maps
// link; the merchant should be able to tap straight through to the map.
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_TEST = /^https?:\/\/[^\s]+$/;

// Split text into plain-text and link segments. We render text as React text
// nodes (never dangerouslySetInnerHTML), so the content stays escaped and only
// well-formed http/https URLs become anchors — `javascript:` / `data:` can
// never turn into a link. The split uses a capturing group so the URLs survive
// as their own array entries; URL_TEST (non-global, so it has no stateful
// lastIndex) decides which entries are links.
export function linkify(text: string): ReactNode[] {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, index) =>
    URL_TEST.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

// Returns the first http(s) URL found in the text, or null. Useful where we
// want a single tappable affordance (e.g. a "Map" link) rather than inlining
// every URL.
export function firstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}
