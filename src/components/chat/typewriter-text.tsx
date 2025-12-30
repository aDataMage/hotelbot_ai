"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
    text: string;
    isStreaming: boolean;
    speed?: number; // characters per second
    children?: React.ReactNode;
}

/**
 * TypewriterText component
 * 
 * When streaming is active, shows a loading indicator.
 * When streaming completes, reveals the text with a smooth typewriter animation.
 */
export function TypewriterText({
    text,
    isStreaming,
    speed = 200,
    children
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isRevealing, setIsRevealing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const textRef = useRef("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Track the final text
    useEffect(() => {
        textRef.current = text;
    }, [text]);

    // Start reveal animation when streaming completes
    useEffect(() => {
        if (!isStreaming && text && !isComplete && !isRevealing) {
            // Streaming just completed - start revealing
            setIsRevealing(true);
            setDisplayedText("");

            let currentIndex = 0;
            const finalText = textRef.current;

            // Calculate interval based on speed (chars per second)
            const intervalMs = 1000 / speed;

            // For long texts, batch characters together for smoother reveal
            const charsPerTick = Math.max(1, Math.ceil(finalText.length / 100));

            intervalRef.current = setInterval(() => {
                currentIndex += charsPerTick;

                if (currentIndex >= finalText.length) {
                    setDisplayedText(finalText);
                    setIsComplete(true);
                    setIsRevealing(false);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                } else {
                    setDisplayedText(finalText.substring(0, currentIndex));
                }
            }, intervalMs);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isStreaming, text, isComplete, isRevealing, speed]);

    // Reset when new message starts
    useEffect(() => {
        if (isStreaming) {
            setDisplayedText("");
            setIsComplete(false);
            setIsRevealing(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [isStreaming]);

    // If streaming, show loading indicator (children can provide custom loader)
    if (isStreaming) {
        return (
            <div className="flex items-center gap-2 py-2">
                <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
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

    // If revealing or complete, show the text
    if (isRevealing || isComplete) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        );
    }

    // Initial state
    return null;
}

/**
 * Simple fade-in reveal for completed messages
 */
export function FadeInText({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}
