"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Robot from "@/assets/robot.png";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

interface Message {
    id: number;
    role: "ai" | "user";
    text: string;
}

const INITIAL_MESSAGES: Message[] = [
    { id: 1, role: "ai", text: "Hi! I'm Buyology AI 👋 Ask me anything about products, deals, or orders!" },
];

export default function AiBotButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

    // Shared motion values — button and desktop panel both read these,
    // so they move in sync without nesting one inside the other.
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);

    const dragMovedRef = useRef(false);
    const constraintsRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const update = () => setIsDesktop(window.innerWidth >= 640);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;
        setMessages(prev => [...prev, { id: Date.now(), role: "user", text: trimmed }]);
        setInput("");
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [
                ...prev,
                { id: Date.now(), role: "ai", text: "Thanks for reaching out! Our AI assistant is currently being set up. Check back soon! 🤖" },
            ]);
        }, 1000);
    };

    const chatInner = (
        <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#402F75] flex-shrink-0">
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                        <Image src={Robot} alt="AI" width={22} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#402F75]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-[14px] leading-tight">Buyology AI</p>
                    <p className="text-white/55 text-[11px]">Online · Always here to help</p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors text-[16px] leading-none"
                    aria-label="Close chat"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#F8F7FD]">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === "ai" && (
                            <div className="w-6 h-6 rounded-full bg-[#402F75] flex items-center justify-center flex-shrink-0 mb-0.5">
                                <Image src={Robot} alt="AI" width={14} />
                            </div>
                        )}
                        <div
                            className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-[#402F75] text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-end gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#402F75] flex items-center justify-center flex-shrink-0">
                            <Image src={Robot} alt="AI" width={14} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#F4F2FC] rounded-full px-4 py-2.5 text-[13px] outline-none placeholder:text-gray-400 text-gray-800"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="w-9 h-9 rounded-full bg-[#402F75] flex items-center justify-center text-white disabled:opacity-35 hover:bg-[#352665] transition-colors flex-shrink-0"
                    aria-label="Send message"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Drag boundary */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[97]" />

            {/* ── MOBILE: backdrop + bottom sheet ── */}
            <AnimatePresence>
                {isDesktop === false && isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 z-[98]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 32 }}
                            className="fixed inset-x-0 bottom-0 h-[85dvh] rounded-t-3xl bg-white flex flex-col overflow-hidden z-[99] shadow-[0_-4px_30px_rgba(64,47,117,0.14)]"
                        >
                            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                                <div className="w-10 h-1 bg-gray-200 rounded-full" />
                            </div>
                            {chatInner}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── DESKTOP: chat panel is SEPARATE from the drag wrapper.
                Both read the same dragX/dragY motion values so they move in sync.
                Because the panel is outside the drag wrapper, its buttons and input
                are never captured by the drag system — no interaction issues. ── */}
            <AnimatePresence>
                {isDesktop && isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        style={{ x: dragX, y: dragY }}
                        className="fixed bottom-[100px] right-[10px] w-[340px] h-[460px] rounded-2xl bg-white flex flex-col overflow-hidden z-[99] border border-gray-100 shadow-[0_8px_40px_rgba(64,47,117,0.18)]"
                    >
                        {chatInner}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Draggable button — contains ONLY the button visual ── */}
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                dragElastic={0}
                style={{ x: dragX, y: dragY }}
                onPointerDown={() => { dragMovedRef.current = false; }}
                onDrag={(_, info) => {
                    if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
                        dragMovedRef.current = true;
                    }
                }}
                onClick={() => {
                    if (!dragMovedRef.current) setIsOpen(prev => !prev);
                }}
                whileDrag={{ scale: 1.08 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="fixed bottom-[10px] right-[10px] z-[100] cursor-grab active:cursor-grabbing select-none"
            >
                <div className="w-[76px] h-[76px] flex items-center justify-center">
                    <div
                        className="flex items-center justify-center bg-[#402F75] rounded-full w-[66px] h-[66px] transition-[box-shadow] duration-200"
                        style={{
                            boxShadow: isOpen
                                ? "0 4px 22px rgba(64,47,117,0.45), 0 0 0 4px rgba(64,47,117,0.18)"
                                : "0 4px 22px rgba(64,47,117,0.45)",
                        }}
                    >
                        <Image src={Robot} alt="Buyology-AI" width={40} />
                    </div>
                </div>
            </motion.div>
        </>
    );
}
