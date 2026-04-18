import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { sendChatMessage, getHealthData } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message { role: "user" | "ai"; text: string }

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! 👋 I'm your VitalMe assistant. Ask me anything about your health trends." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: healthData } = useQuery({
    queryKey: ["healthData"],
    queryFn: getHealthData,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    
    const userMessage = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setTyping(true);

    try {
      const history = messages.map(m => ({ 
        role: (m.role === 'ai' ? 'assistant' : 'user') as "assistant" | "user", 
        content: m.text 
      }));
      
      const response = await sendChatMessage(userMessage, healthData, history);
      setMessages((m) => [...m, { role: "ai", text: response.reply }]);
    } catch (error) {
      setMessages((m) => [...m, { role: "ai", text: "I'm having a bit of trouble connecting right now. Let's try again in a moment!" }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-10rem)] max-w-3xl mx-auto relative overflow-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-4 shrink-0 px-1">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">AI Coach</h1>
          <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">Medical Intelligence Active</p>
        </div>
      </motion.div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-1 overscroll-contain">
        {messages.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[88%] md:max-w-[85%] px-4 py-3 md:px-5 md:py-4 rounded-2xl md:rounded-3xl text-[13px] md:text-sm leading-relaxed shadow-sm ${
              m.role === "user" 
                ? "bg-primary text-primary-foreground rounded-br-sm" 
                : "glass-card rounded-bl-sm text-foreground bg-surface-lowest/95 border border-white/20"
            }`}>
              <div className="markdown-content">
                {m.role === "ai" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm bg-surface-lowest/95">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="mt-4 pb-4 md:pb-0 shrink-0">
        <div className="flex gap-2 md:gap-3 bg-surface-lowest/90 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-2xl shadow-primary/5 ring-1 ring-black/5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Talk pulse health..."
            className="flex-1 bg-transparent px-3 md:px-4 py-2 md:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={send} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
