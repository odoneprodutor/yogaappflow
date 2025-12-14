
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { aiCoachService, CoachContext } from '../services/aiCoach';
import { SessionRecord, UserPreferences, TrainingPlan } from '../types';

interface AICoachWidgetProps {
    user: { name: string; id: string } | null;
    preferences: UserPreferences;
    history: SessionRecord[];
    activePlan?: TrainingPlan | null;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'coach';
    timestamp: Date;
}

export const AICoachWidget: React.FC<AICoachWidgetProps> = ({ user, preferences, history, activePlan }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: `Olá ${user?.name.split(' ')[0] || 'Yogi'}! Sou seu assistente de jornada. Como posso te ajudar hoje?`,
            sender: 'coach',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Prepare Context
        const context: CoachContext = {
            name: user.name,
            userParams: preferences,
            recentHistory: history,
            activePlan: activePlan
        };

        // Call AI
        const responseText = await aiCoachService.sendMessage(userMsg.text, context);

        const coachMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'coach',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, coachMsg]);
        setIsTyping(false);
    };

    if (!user) return null; // Don't show if not logged in

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-sage-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-50 animate-bounce-slow"
                    title="Falar com o Coach"
                >
                    <Sparkles size={24} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sage-500"></span>
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-[350px] md:w-96 bg-white rounded-2xl shadow-2xl border border-sage-100 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[600px] h-[80vh]">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-sage-600 to-emerald-600 rounded-t-2xl flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">YogaCoach</h3>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                                    <span className="text-xs">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs
                                    ${msg.sender === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-sage-100 text-sage-600'}`}>
                                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                    ${msg.sender === 'user'
                                            ? 'bg-white text-stone-800 rounded-tr-none border border-stone-100'
                                            : 'bg-sage-600 text-white rounded-tl-none'}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-sage-100 flex-shrink-0 flex items-center justify-center text-sage-600">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-sage-600 text-white p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
                                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-100 rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Pergunte sobre sua prática..."
                                className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                className="w-10 h-10 bg-sage-600 text-white rounded-full flex items-center justify-center hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={18} className={inputText.trim() ? "ml-0.5" : ""} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};
