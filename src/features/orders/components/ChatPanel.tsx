"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "@/shared/lib/tokenManager";
import { getChatHistory } from "../services/orders.api";
import type { ChatMsg } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPanelProps {
    ecommerceOrderId: string;
    deliveryOrderId: string;
    orderStatus: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatPanel({
    ecommerceOrderId,
    deliveryOrderId,
    orderStatus,
    isOpen,
    onClose,
}: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const clientRef = useRef<Client | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isChatActive = ["COURIER_ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(orderStatus);
    const isReadOnly = ["DELIVERED", "CANCELLED", "FAILED"].includes(orderStatus);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Load history
    useEffect(() => {
        if (!isOpen) return;

        const token = getAccessToken();
        if (!token) return;

        setLoading(true);
        getChatHistory(ecommerceOrderId)
            .then((data) => {
                // Only render TEXT messages
                const texts = data.content.filter((m) => m.messageType === "TEXT");
                setMessages(texts.reverse()); // History is usually newest first, we want oldest first
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [ecommerceOrderId, isOpen]);

    // WebSocket connection
    useEffect(() => {
        if (!isOpen || !deliveryOrderId || !isChatActive) return;

        const token = getAccessToken();
        if (!token) return;

        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        // Convert http/https to ws/wss and append /ws
        const wsUrl = `${baseURL.replace(/^http/, "ws")}/ws`;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                "X-Client-Type": "WEB",
            },
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/user/queue/chat/${deliveryOrderId}`, (frame) => {
                    const msg: ChatMsg = JSON.parse(frame.body);
                    if (msg.messageType !== "TEXT") return;
                    setMessages((prev) => [...prev, msg]);
                });
            },
            onDisconnect: () => setConnected(false),
            reconnectDelay: 5000,
            debug: (str) => console.log('[ChatWS]', str),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [deliveryOrderId, isChatActive, isOpen]);

    function handleSend() {
        if (!input.trim() || !clientRef.current?.connected) return;
        clientRef.current.publish({
            destination: `/app/chat/${deliveryOrderId}/send`,
            body: JSON.stringify({
                messageType: "TEXT",
                content: input.trim(),
                clientType: "WEB",
            }),
        });
        setInput("");
    }

    function handleCall() {
        alert("Please install the mobile app to use the call feature.");
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 right-6 w-[360px] max-w-[calc(100vw-48px)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#402F75] text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-[14px]">
                                C
                            </div>
                            <div>
                                <p className="text-[14px] font-bold">Courier Chat</p>
                                <p className="text-[11px] opacity-80">
                                    {connected ? "Online" : isChatActive ? "Connecting..." : "Offline"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCall}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="Call"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50"
                    >
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-[#402F75] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                <p className="text-[13px] text-gray-400">No messages yet. Send a message to the courier.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.messageId}
                                    className={`flex flex-col ${
                                        msg.senderType === "CUSTOMER" ? "items-end" : "items-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-[13px] ${
                                            msg.senderType === "CUSTOMER"
                                                ? "bg-[#402F75] text-white rounded-br-none"
                                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(msg.sentAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Input */}
                    {isChatActive ? (
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-[13px] focus:ring-2 focus:ring-[#402F75]/20 focus:outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || !connected}
                                    className="w-10 h-10 rounded-full bg-[#402F75] text-white flex items-center justify-center transition-opacity disabled:opacity-50"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : isReadOnly ? (
                        <div className="p-4 bg-gray-100 text-center border-t border-gray-200">
                            <p className="text-[12px] text-gray-500 font-medium">This chat has ended.</p>
                        </div>
                    ) : null}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
