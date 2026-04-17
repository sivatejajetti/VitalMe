import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { sendChatMessage, getHealthData } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

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
      // Map frontend roles to match Anthropic message structure if needed, or handle in service
      const history = messages.map(m => ({ 
        role: m.role === 'ai' ? 'assistant' : 'user', 
        content: m.text 
      }));
      
      const response = await sendChatMessage(userMessage, healthData, []);
      setMessages((m) => [...m, { role: "ai", text: response.reply }]);
    } catch (error) {
      setMessages((m) => [...m, { role: "ai", text: "I'm having a bit of trouble connecting right now. Let's try again in a moment!" }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] max-w-3xl mx-auto pb-24 lg:pb-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">AI Coach</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Medical Intelligence Active</p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-1">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
              m.role === "user" 
                ? "bg-primary text-primary-foreground rounded-br-lg" 
                : "glass-card rounded-bl-lg text-foreground bg-surface-lowest/90 border border-white/20"
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-card px-5 py-4 rounded-3xl rounded-bl-lg bg-surface-lowest/90">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-6 flex gap-3 relative z-10">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask your clinical assistant..."
            className="w-full bg-surface-lowest/80 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xl transition-all"
          />
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={send} 
          className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default Chat;
