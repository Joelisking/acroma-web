"use client";

import * as React from "react";

import type { ConversationWithMessages, Message } from "@/lib/api/types";
import { useAcromaSocket } from "@/hooks/use-acroma-socket";
import { MessageBubble } from "./message-bubble";
import { ReplyComposer } from "./reply-composer";

type ChatThreadProps = {
  conversation: ConversationWithMessages;
  businessId: string;
};

type NewMessagePayload = {
  conversationId: string;
  message: Message;
};

export function ChatThread({ conversation, businessId }: ChatThreadProps) {
  const [messages, setMessages] = React.useState<Message[]>(
    conversation.messages,
  );
  const conversationIdRef = React.useRef(conversation.id);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const firstScrollRef = React.useRef(true);

  React.useEffect(() => {
    if (conversationIdRef.current !== conversation.id) {
      conversationIdRef.current = conversation.id;
      setMessages(conversation.messages);
      return;
    }
    setMessages((prev) => mergeById(prev, conversation.messages));
  }, [conversation.id, conversation.messages]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Jump instantly on first paint (opening the thread); animate only for
    // messages that arrive while you're reading.
    el.scrollTo({
      top: el.scrollHeight,
      behavior: firstScrollRef.current ? "auto" : "smooth",
    });
    firstScrollRef.current = false;
  }, [messages.length]);

  const handlers = React.useMemo(
    () => ({
      new_message: (payload: unknown) => {
        const data = payload as NewMessagePayload | null;
        if (!data || data.conversationId !== conversationIdRef.current) return;
        setMessages((prev) =>
          prev.some((m) => m.id === data.message.id)
            ? prev
            : [...prev, data.message],
        );
      },
    }),
    [],
  );

  useAcromaSocket(businessId, handlers);

  const appendOptimistic = React.useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const reconcileOptimistic = React.useCallback(
    (tempId: string, real: Message) => {
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === real.id)) return withoutTemp;
        return [...withoutTemp, real];
      });
    },
    [],
  );

  const rollbackOptimistic = React.useCallback((tempId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
  }, []);

  const firstOwnerIdx = messages.findIndex((m) => m.sender === "OWNER");

  return (
    <>
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-4"
      >
        {messages.length === 0 ? (
          <p className="text-muted-foreground mx-auto mt-10 max-w-xs text-center text-sm">
            No messages yet.
          </p>
        ) : (
          messages.map((m, i) => (
            <React.Fragment key={m.id}>
              {i === firstOwnerIdx && firstOwnerIdx > 0 ? (
                <div className="text-muted-foreground my-1 flex items-center gap-3 px-2 text-[0.7rem] font-medium">
                  <span className="bg-border h-px flex-1" />
                  You stepped in. Acroma paused.
                  <span className="bg-border h-px flex-1" />
                </div>
              ) : null}
              <MessageBubble message={m} />
            </React.Fragment>
          ))
        )}
      </div>

      <ReplyComposer
        conversationId={conversation.id}
        status={conversation.status}
        onOptimisticAppend={appendOptimistic}
        onOptimisticReconcile={reconcileOptimistic}
        onOptimisticRollback={rollbackOptimistic}
      />
    </>
  );
}

function mergeById(prev: Message[], next: Message[]): Message[] {
  const byId = new Map<string, Message>();
  for (const m of prev) byId.set(m.id, m);
  for (const m of next) byId.set(m.id, m);
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
