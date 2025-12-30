"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DefaultChatTransport, TextUIPart } from "ai";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import { ToolResult } from "@/components/chat/tool-result";
import { FadeInText } from "@/components/chat/typewriter-text";

import { useSearchParams } from "next/navigation";

export default function ChatInterface() {
    const [input, setInput] = useState("");
    const searchParams = useSearchParams();
    const hasAutoSent = useRef(false);

    const welcomeMessage: TextUIPart = {
        type: 'text',
        text: 'Welcome to HotelAI. I\'m your personal concierge, here to help you discover the perfect room, check availability, and answer any questions about your stay. How may I assist you today?',
        state: 'done'
    };

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            credentials: 'include',
        }),
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                parts: [welcomeMessage],
            },
        ],
        onError: (error) => {
            console.error("Chat error:", error);
        }
    });

    // Handle auto-start from room links
    useEffect(() => {
        const roomId = searchParams.get("roomId");
        const intent = searchParams.get("intent");

        if (roomId && !hasAutoSent.current) {
            hasAutoSent.current = true;
            const text = `I am looking at room ID "${roomId}" and I'm interested in booking it. Can you help me with availability?`;
            // Small timeout to ensure the chat is ready and provides a better UX
            setTimeout(() => {
                sendMessage({ text });
            }, 500);
        }
    }, [searchParams, sendMessage]);

    const isLoading = status === "submitted" || status === "streaming";
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");

        sendMessage({ text: userMessage });
    };

    const handleToolResult = (toolCallId: string, result: any) => {
        const text = `Here are my booking details:
Name: ${result.guestName}
Email: ${result.guestEmail}
Phone: ${result.guestPhone}
Special Requests: ${result.specialRequests || 'None'}`;

        sendMessage({ text });
    };

    return (
        <div className="flex flex-col h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                {/* ... existing header code ... */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">HotelAI Concierge</h1>
                        <p className="text-xs text-[var(--muted)]">Your personal assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                    </span>
                </div>
            </header>

            {/* Messages Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar"
            >
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                            // Hide automated form submission messages
                            if (message.role === 'user' &&
                                message.parts.some(p => p.type === 'text' && p.text.startsWith('Here are my booking details:'))) {
                                return null;
                            }

                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: [0.25, 0.1, 0.25, 1],
                                        delay: index === messages.length - 1 ? 0.05 : 0
                                    }}
                                    className={cn(
                                        "flex gap-3",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {/* AI Avatar */}
                                    {message.role === "assistant" && (
                                        <div className="flex-shrink-0 w-9 h-9 rounded-full gradient-gold flex items-center justify-center shadow-md ring-2 ring-[var(--gold-light)]/30">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                                            message.role === "user"
                                                ? "gradient-gold text-white shadow-md"
                                                : "glass bg-[var(--surface)] shadow-sm border border-[var(--border)]"
                                        )}
                                    >
                                        {message.parts.map((part, idx) => {
                                            // Check if this message has a tool with displayable output
                                            // Exclude searchKnowledge - we want AI text for knowledge queries
                                            const hasDisplayableToolResult = message.parts.some(p => {
                                                // Check old format (tool-invocation)
                                                if (p.type === 'tool-invocation' && 'result' in p.toolInvocation) {
                                                    const toolName = p.toolInvocation.toolName;
                                                    // Never hide text for searchKnowledge - let AI synthesize response
                                                    if (toolName === 'searchKnowledge') return false;

                                                    const result = p.toolInvocation.result as any;
                                                    // Don't hide if needsPreferences with no rooms (show preference questions)
                                                    if (result?.needsPreferences === true && result?.rooms?.length === 0) {
                                                        return false;
                                                    }
                                                    // Hide for any other tool with displayable result
                                                    if (result?.rooms?.length > 0) return true;
                                                    if (result?.escalated) return true;
                                                    if (result?.confirmationNumber) return true;
                                                    if (result?.status === 'waiting_for_input') return true;
                                                    return false;
                                                }
                                                // Check new SDK v6 format (tool-searchRooms, etc.)
                                                if (p.type.startsWith('tool-')) {
                                                    const toolPart = p as any;
                                                    const toolName = p.type.replace('tool-', '');
                                                    // Never hide text for searchKnowledge
                                                    if (toolName === 'searchKnowledge') return false;

                                                    const result = toolPart.output;
                                                    // Don't hide if needsPreferences with no rooms
                                                    if (result?.needsPreferences === true && result?.rooms?.length === 0) {
                                                        return false;
                                                    }
                                                    // Hide only for displayable results
                                                    if (result?.rooms?.length > 0) return true;
                                                    if (result?.escalated) return true;
                                                    if (result?.confirmationNumber) return true;
                                                    if (result?.status === 'waiting_for_input') return true;
                                                    return false;
                                                }
                                                return false;
                                            });

                                            if (part.type === 'text') {
                                                // Show text if no displayable tool results
                                                if (hasDisplayableToolResult) return null;

                                                // Check if this is the last message and still streaming
                                                const isLastMessage = index === messages.length - 1;
                                                const isMessageStreaming = isLastMessage && status === 'streaming';

                                                // If streaming, show loading indicator instead of partial text
                                                if (isMessageStreaming) {
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 py-2">
                                                            <motion.div className="flex gap-1">
                                                                {[0, 1, 2].map((i) => (
                                                                    <motion.span
                                                                        key={i}
                                                                        className="w-2 h-2 rounded-full bg-[var(--gold)]"
                                                                        animate={{
                                                                            scale: [1, 1.2, 1],
                                                                            opacity: [0.5, 1, 0.5],
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.6,
                                                                            repeat: Infinity,
                                                                            delay: i * 0.2,
                                                                        }}
                                                                    />
                                                                ))}
                                                            </motion.div>
                                                            <span className="text-sm text-[var(--muted)]">Thinking...</span>
                                                        </div>
                                                    );
                                                }

                                                // When complete, fade in the full text
                                                return (
                                                    <FadeInText key={idx}>
                                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                                            <ReactMarkdown
                                                                components={{
                                                                    h3: ({ children }) => (
                                                                        <h3 className="text-base font-semibold mt-4 mb-2 text-[var(--foreground)]">{children}</h3>
                                                                    ),
                                                                    strong: ({ children }) => (
                                                                        <strong className="font-semibold text-[var(--gold)]">{children}</strong>
                                                                    ),
                                                                    ul: ({ children }) => (
                                                                        <ul className="list-none pl-0 space-y-1">{children}</ul>
                                                                    ),
                                                                    li: ({ children }) => (
                                                                        <li className="text-sm leading-relaxed">{children}</li>
                                                                    ),
                                                                    p: ({ children }) => (
                                                                        <p className="text-sm leading-relaxed my-2">{children}</p>
                                                                    ),
                                                                }}
                                                            >
                                                                {part.text}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </FadeInText>
                                                );
                                            }
                                            // Handle tool-invocation (old format)
                                            if (part.type === 'tool-invocation') {
                                                return (
                                                    <div key={idx} className="mt-3 first:mt-0">
                                                        <ToolResult
                                                            toolName={part.toolInvocation.toolName}
                                                            state={part.toolInvocation.state}
                                                            args={part.toolInvocation.args}
                                                            result={'result' in part.toolInvocation ? part.toolInvocation.result : undefined}
                                                            toolCallId={part.toolInvocation.toolCallId}
                                                            onToolResult={handleToolResult}
                                                        />
                                                    </div>
                                                );
                                            }
                                            // Handle tool-{toolName} format (AI SDK v6)
                                            if (part.type.startsWith('tool-')) {
                                                const toolPart = part as any;
                                                const toolName = part.type.replace('tool-', '');
                                                return (
                                                    <div key={idx} className="mt-3 first:mt-0">
                                                        <ToolResult
                                                            toolName={toolName}
                                                            state={toolPart.state === 'output-available' ? 'result' : 'call'}
                                                            args={toolPart.input}
                                                            result={toolPart.output}
                                                            toolCallId={toolPart.toolCallId}
                                                            onToolResult={handleToolResult}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>

                                    {/* User Avatar */}
                                    {message.role === "user" && (
                                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--surface-dim)] flex items-center justify-center shadow-sm border border-[var(--border)]">
                                            <span className="text-sm font-medium text-[var(--foreground)]">You</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Loading Indicator */}
                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex gap-3 justify-start"
                            >
                                <div className="flex-shrink-0 w-9 h-9 rounded-full gradient-gold flex items-center justify-center shadow-md ring-2 ring-[var(--gold-light)]/30">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="glass bg-[var(--surface)] rounded-2xl px-5 py-4 shadow-sm border border-[var(--border)]">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[var(--gold)] typing-dot" />
                                        <span className="w-2 h-2 rounded-full bg-[var(--gold)] typing-dot" />
                                        <span className="w-2 h-2 rounded-full bg-[var(--gold)] typing-dot" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Error State */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex justify-center"
                            >
                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 max-w-md">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {error.message || "Something went wrong. Please try again."}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-[var(--border)] bg-[var(--background)]">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className={cn(
                                "w-full px-5 py-3.5 pr-14 rounded-full",
                                "bg-[var(--surface)] border border-[var(--border)]",
                                "text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]",
                                "shadow-sm transition-all duration-200",
                                "focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--ring)]",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2",
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                "transition-all duration-200",
                                input.trim() && !isLoading
                                    ? "gradient-gold text-white shadow-md hover:shadow-lg hover:scale-105"
                                    : "bg-[var(--surface-dim)] text-[var(--muted)] cursor-not-allowed"
                            )}
                        >
                            <Send className="w-4 h-4" />
                            <span className="sr-only">Send message</span>
                        </button>
                    </form>
                    <p className="text-center mt-3 text-[11px] text-[var(--muted)]">
                        AI responses may not always be accurate. Please verify important booking details.
                    </p>
                </div>
            </div >
        </div >
    );
}