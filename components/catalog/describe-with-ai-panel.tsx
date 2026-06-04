"use client";

import * as React from "react";
import { Loader2, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedProduct } from "@/lib/api/types";
import { useVocab } from "@/components/vocabulary-provider";

const MAX_LENGTH = 800;
const MIN_LENGTH = 3;

type Props = {
  parsedPreview: ParsedProduct | null;
  originalDescription: string;
  parsing: boolean;
  refining: boolean;
  onParse: (description: string) => void;
  onRefine: (followUp: string) => void;
  onEditOriginal: () => void;
};

export function DescribeWithAiPanel({
  parsedPreview,
  originalDescription,
  parsing,
  refining,
  onParse,
  onRefine,
  onEditOriginal,
}: Props) {
  if (parsedPreview) {
    return (
      <PostParse
        originalDescription={originalDescription}
        refining={refining}
        onRefine={onRefine}
        onEditOriginal={onEditOriginal}
      />
    );
  }
  return <PreParse parsing={parsing} initialText={originalDescription} onParse={onParse} />;
}

function PreParse({
  parsing,
  initialText,
  onParse,
}: {
  parsing: boolean;
  initialText: string;
  onParse: (description: string) => void;
}) {
  const vocab = useVocab();
  const [text, setText] = React.useState(initialText);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        rows={5}
        placeholder={
          vocab.tracksStock
            ? `Describe your ${vocab.itemLower} in a sentence or two. e.g. "Nike Air Max in black, sizes 8 to 12, GHS 850. White also available, only sizes 9 to 11."`
            : `Describe your ${vocab.itemLower} in a sentence or two. e.g. "Jollof rice with grilled chicken, GHS 45. Regular or large, large is GHS 60."`
        }
        className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[120px] w-full resize-y rounded-xl border p-3 text-sm leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none"
      />
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => onParse(text.trim())}
          disabled={text.trim().length < MIN_LENGTH || parsing}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {parsing ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {parsing ? "Understanding…" : "Parse with AI"}
        </Button>
      </div>
    </div>
  );
}

function PostParse({
  originalDescription,
  refining,
  onRefine,
  onEditOriginal,
}: {
  originalDescription: string;
  refining: boolean;
  onRefine: (followUp: string) => void;
  onEditOriginal: () => void;
}) {
  const vocab = useVocab();
  const [followUp, setFollowUp] = React.useState("");

  function handleRefine() {
    const trimmed = followUp.trim();
    if (trimmed.length < MIN_LENGTH || refining) return;
    onRefine(trimmed);
    setFollowUp("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Your description
          </p>
          <button
            type="button"
            onClick={onEditOriginal}
            className="text-muted-foreground inline-flex items-center gap-1 text-xs"
          >
            <Pencil className="size-3" />
            Edit
          </button>
        </div>
        <div className="border-border/70 bg-muted/40 rounded-xl border px-4 py-3">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {originalDescription}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Tell AI what to change
        </p>
        <textarea
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value.slice(0, MAX_LENGTH))}
          rows={3}
          placeholder={
            vocab.tracksStock
              ? 'e.g. "Change the price to GHS 450"\n"Add a medium size"\n"Stock is 15, not 0"'
              : 'e.g. "Change the price to GHS 45"\n"Add a large size"\n"Make it spicy"'
          }
          className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/40 placeholder:text-muted-foreground min-h-[80px] w-full resize-y rounded-xl border p-3 text-sm leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleRefine}
          disabled={followUp.trim().length < MIN_LENGTH || refining}
          className="bg-brand-orange hover:bg-brand-orange/90 h-10 gap-2 rounded-xl px-5"
        >
          {refining ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {refining ? "Applying…" : "Refine with AI"}
        </Button>
      </div>
    </div>
  );
}
