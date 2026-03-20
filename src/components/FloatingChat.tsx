// src/components/FloatingChat.tsx
// Global floating chatbot — appears on every page.
// Data-aware: passes user's trade summary as context to every message.
// Handles both trade-specific questions and general coaching questions.

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from 'lucide-react';
import { CSVTradeData } from '@/csvManager';
import CSVManager from '@/csvManager';

interface Message {
  role:    'user' | 'assistant';
  content: string;
}

// ── Build a compact trade context summary ─────────────────────────────────────
// This gets injected into every message so the AI knows the user's data.
// We summarise rather than sending raw trades to keep the payload small.

function buildTradeContext(trades: CSVTradeData[]): string {
  if (trades.length === 0) return 'The user has no trade data uploaded yet.';

  const winners     = trades.filter(t => t.result > 0);
  const losers      = trades.filter(t => t.result <= 0);
  const totalPnL    = trades.reduce((s, t) => s + t.result, 0);
  const winRate     = ((winners.length / trades.length) * 100).toFixed(1);
  const avgRR       = (trades.reduce((s, t) => s + t.rr, 0) / trades.length).toFixed(2);
  const avgWin      = winners.length > 0
    ? (winners.reduce((s, t) => s + t.result, 0) / winners.length).toFixed(0) : '0';
  const avgLoss     = losers.length > 0
    ? Math.abs(losers.reduce((s, t) => s + t.result, 0) / losers.length).toFixed(0) : '0';
  const violations  = trades.filter(t => t.ruleViolation).length;

  // Per-pair PnL
  const pairPnL: Record<string, number> = {};
  trades.forEach(t => { pairPnL[t.pair] = (pairPnL[t.pair] || 0) + t.result; });
  const sortedPairs = Object.entries(pairPnL).sort((a, b) => b[1] - a[1]);
  const bestPair    = sortedPairs[0]?.[0] ?? 'N/A';
  const worstPair   = sortedPairs[sortedPairs.length - 1]?.[0] ?? 'N/A';

  // Recent 5 trades
  const recent = [...trades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(t => `${t.pair} ${t.direction} ${t.result > 0 ? '+' : ''}$${t.result.toFixed(0)} (${t.rr}R)`)
    .join(', ');

  return `
User's trading account summary:
- Total trades: ${trades.length}
- Win rate: ${winRate}%
- Total P&L: $${totalPnL.toFixed(0)}
- Average R:R: ${avgRR}
- Average win: $${avgWin} | Average loss: $${avgLoss}
- Rule violations: ${violations} of ${trades.length} trades
- Best pair: ${bestPair} | Worst pair: ${worstPair}
- Recent trades: ${recent}
`.trim();
}


// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(tradeContext: string): string {
  return `You are Dr. Drawdown, an expert trading coach embedded in a trading journal app called Tradient.

You have access to this user's real trading data:
${tradeContext}

Your role:
- Answer questions about their specific trades and performance using the data above
- Answer general trading questions (strategy, psychology, risk management, market structure)
- Be direct, specific, and actionable — never vague
- Reference their actual numbers when relevant ("your win rate of X%" not "your win rate")
- Keep responses concise — 2-4 sentences unless a detailed explanation is genuinely needed
- Never make up trade data — only reference what is in the summary above
- If asked something outside trading, politely redirect to trading topics`;
}


// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingChat() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [trades,     setTrades]     = useState<CSVTradeData[]>([]);
  const messagesEndRef               = useRef<HTMLDivElement>(null);
  const inputRef                     = useRef<HTMLInputElement>(null);

  // Load trades once on mount
  useEffect(() => {
    CSVManager.loadFromAPI().then(setTrades).catch(() => setTrades([]));
    const handler = () => CSVManager.loadFromAPI().then(setTrades).catch(() => setTrades([]));
    window.addEventListener('tradesUpdated', handler);
    return () => window.removeEventListener('tradesUpdated', handler);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiApiUrl = import.meta.env.VITE_AI_API_URL;
      if (!aiApiUrl) throw new Error('API URL not configured');

      const tradeContext   = buildTradeContext(trades);
      const systemPrompt   = buildSystemPrompt(tradeContext);

      // Build history in OpenAI format — exclude system message
      const history = messages.map(m => ({
        role:    m.role,
        content: m.content,
      }));

      const response = await fetch(`${aiApiUrl.replace(/\/$/, '')}/ai/query`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:    'coaching_chat',
          payload: {
            message: text,
            history: [
              { role: 'system', content: systemPrompt },
              ...history,
            ],
          },
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const reply = data.reply ?? 'Sorry, I could not generate a response. Please try again.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch {
      setMessages(prev => [
        ...prev,
        {
          role:    'assistant',
          content: 'I am having trouble connecting right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, trades]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 20,  scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-50 w-[350px] sm:w-[400px] flex flex-col rounded-2xl border border-border/40 bg-background shadow-2xl overflow-hidden"
            style={{ maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Dr. Drawdown</p>
                  <p className="text-[10px] text-white/70">
                    {trades.length > 0
                      ? `Knows your ${trades.length} trades`
                      : 'Upload trades for data-aware chat'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-[10px] text-white/60 hover:text-white transition-colors px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Minimize2 className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                    <Bot className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Ask Dr. Drawdown</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                      Ask about your trades, performance patterns, or any trading question
                    </p>
                  </div>
                  {/* Starter questions */}
                  <div className="w-full space-y-2 mt-2">
                    {[
                      'What is my biggest weakness?',
                      'Why am I losing on Fridays?',
                      'How do I improve my R:R?',
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="shrink-0 p-1 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg h-fit mt-1">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted/50 text-foreground rounded-bl-sm border border-border/20'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="shrink-0 p-1 bg-muted rounded-lg h-fit mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="shrink-0 p-1 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg h-fit mt-1">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-muted/50 border border-border/20">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/20 bg-background/80 backdrop-blur shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your trades..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-border/40 bg-muted/30 focus:outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
                >
                  {isLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Send className="h-3.5 w-3.5" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 z-50 p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-purple-500/30 transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? {} : {
          boxShadow: ['0 0 0 0 rgba(147,51,234,0.4)', '0 0 0 12px rgba(147,51,234,0)', '0 0 0 0 rgba(147,51,234,0)'],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot — shows when chat has not been opened yet */}
        {!isOpen && messages.length === 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
        )}
      </motion.button>
    </>
  );
}