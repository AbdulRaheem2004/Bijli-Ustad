import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  BookOpen, 
  User, 
  Bot,
  Zap
} from 'lucide-react';
import { CustomerRagChatService, type ChatMessage } from '../rag/customerChat.ts';
import type { BillCalculationResult } from '../engine/types.ts';

interface RagChatDrawerProps {
  billContext?: BillCalculationResult | null;
  language: 'english' | 'roman_urdu' | 'urdu';
}

const chatService = new CustomerRagChatService();

export const RagChatDrawer: React.FC<RagChatDrawerProps> = ({
  billContext,
  language,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'roman_urdu'
          ? 'Salam! Main aap ka Bijli Sahulat Assistant hoon. Main official NEPRA SROs aur Consumer Service Manual (CSM) ke mutabiq aap ke bill aur bijli ke masail ke jawab deta hoon. Koi bhi sawal poochein!'
          : 'Welcome! I am your Bijli Sahulat Regulatory Assistant. I provide answers grounded in official NEPRA SROs and the Consumer Service Manual (CSM). Ask me anything about your bill or tariff rights!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: 'FPA kya hota hai?',
      query: 'What is FPA on electricity bill and how is it calculated?',
    },
    {
      label: '200 units se ooper mehnga bill?',
      query: 'Why did my bill jump above 200 units protected category?',
    },
    {
      label: 'Detection bill ke rules?',
      query: 'What are NEPRA CSM rules regarding slow meters and detection bills?',
    },
    {
      label: 'Solar net-metering settlement?',
      query: 'How does solar net-metering export credit and quarterly rollover work?',
    },
    {
      label: 'AC se bijli kaise bachayein?',
      query: 'How many units does an inverter AC use at 26 degrees?',
    },
  ];

  const handleSend = (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // RAG retrieval & generation
    setTimeout(() => {
      const assistantMsg = chatService.answer(q, billContext, language);
      setMessages((prev) => [...prev, assistantMsg]);
    }, 150);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[650px] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <span>Bijli Sahulat RAG Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Grounded in official NEPRA Consumer Service Manual &amp; Gazette SROs
            </p>
          </div>
        </div>

        {billContext && billContext.totalUnits > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 text-[11px] text-neutral-300 font-mono">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Active Bill: {billContext.totalUnits} Units</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-neutral-950/70 border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] text-neutral-500 uppercase font-semibold shrink-0">
          Topics:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p.query)}
            className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors shrink-0 text-xs border border-neutral-700/60"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium shadow-md'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Legal Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-neutral-800 space-y-1.5">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    Official Legal Ground Truth:
                  </span>
                  {msg.citations.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 space-y-0.5"
                    >
                      <div className="font-semibold text-emerald-400">{c.sro}</div>
                      <div className="text-[10px] text-neutral-400">{c.title}</div>
                      <div className="text-[9px] text-neutral-500 font-mono">
                        Authority: {c.authority}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-2 font-mono text-right ${
                  msg.sender === 'user' ? 'text-emerald-200' : 'text-neutral-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3.5 border-t border-neutral-800 bg-neutral-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              language === 'roman_urdu'
                ? 'Apna sawal likhein (e.g. FPA kya hai? ya Detection bill rules)...'
                : 'Ask anything about tariffs, FPA, detection bills, or NEPRA rights...'
            }
            className="flex-1 px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 outline-none focus:border-emerald-500 placeholder:text-neutral-600 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
