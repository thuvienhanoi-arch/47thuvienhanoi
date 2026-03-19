import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Mic, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export default function ChatAI() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Xin chào! Tôi là trợ lý AI của Thư viện Hà Nội. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) throw new Error('Failed to fetch chat');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        accumulatedText += chunk;
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, text: accumulatedText }];
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col mt-8">
      <div className="flex items-center gap-3 mb-8 px-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: 'var(--primary)', opacity: 0.1, borderColor: 'var(--primary)' }}>
          <Bot className="w-6 h-6" style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Trò chuyện với AI</h1>
          <p className="text-[var(--text-muted)] text-sm">Hỏi bất cứ điều gì về sách và văn hóa</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'text-black' : 'bg-[var(--glass-bg)] text-[var(--text-muted)]'
                }`} style={m.role === 'user' ? { backgroundColor: 'var(--primary)' } : {}}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'text-black font-medium' 
                    : 'bg-[var(--glass-bg)] border border-[var(--border-main)] text-[var(--text-main)]'
                }`} style={m.role === 'user' ? { backgroundColor: 'var(--primary)' } : {}}>
                  <Markdown>{m.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div className="p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--border-main)] flex gap-1">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 px-4 pb-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" style={{ backgroundColor: 'var(--primary)' }} />
          <div className="relative bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl p-2 flex items-center gap-2">
            <button className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--text-main)] placeholder:text-[var(--text-muted)] px-2"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
