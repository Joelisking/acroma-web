"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { Message } from "@/lib/api/types";

/**
 * Renders a message's attached media in the conversation thread.
 *
 * - DOCUMENT (a sent menu/catalog PDF): a compact file card linking to the
 *   public CDN URL.
 * - IMAGE: an inline thumbnail. Media WE sent has a direct `mediaUrl`;
 *   customer-sent images have none, so we load them through the same-origin
 *   media proxy (`/api/conversations/:id/media/:messageId`), which can 404 for
 *   media WhatsApp no longer retains — handled with a graceful fallback.
 */
export function MessageMedia({ message }: { message: Message }) {
  const [failed, setFailed] = useState(false);

  if (message.mediaType === "DOCUMENT" && message.mediaUrl) {
    return (
      <a
        href={message.mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="border-border bg-card/60 hover:bg-card flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
      >
        <FileText className="text-brand-blue size-5 shrink-0" strokeWidth={2} />
        <span className="truncate text-sm font-medium">
          {message.mediaFilename ?? "Document"}
        </span>
      </a>
    );
  }

  if (message.mediaType === "IMAGE") {
    if (failed) {
      return (
        <span className="text-muted-foreground text-xs italic">
          Image unavailable
        </span>
      );
    }
    const src =
      message.mediaUrl ??
      `/api/conversations/${message.conversationId}/media/${message.id}`;
    return (
      <a href={src} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Shared image"
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-72 max-w-full rounded-lg object-cover"
        />
      </a>
    );
  }

  return null;
}
