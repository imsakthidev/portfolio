"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import styles from './ChatAssistant.module.css';

import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '', // Start empty for the typewriter effect
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_QUESTIONS = [
    "What are your website packages?",
    "How much does a SaaS MVP cost?",
    "Do you do YouTube Shorts editing?",
    "What is the Complete Personal Brand package?",
    "How do we get started?"
  ];

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // Automatically open the chat window 1.5 seconds after page load (or 4.8s if splash screen is running)
    const splashShown = sessionStorage.getItem('splashShown');
    const delay = splashShown ? 1500 : 4800;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Typewriter effect for the greeting
    if (isOpen) {
      const greeting = t('chat.greeting');
      
      // Reset the first message when language changes (if user hasn't chatted yet)
      setMessages(prev => {
         if (prev.length === 1) {
             return [{ id: '1', role: 'assistant', content: '' }];
         }
         return prev;
      });
      
      const interval = setInterval(() => {
        setMessages(prev => {
          if (prev.length > 1) {
             clearInterval(interval);
             return prev;
          }
          const firstMsg = prev[0];
          if (!firstMsg || firstMsg.content.length >= greeting.length) {
            clearInterval(interval);
            return prev;
          }
          const nextContent = greeting.slice(0, firstMsg.content.length + 1);
          return [{ ...firstMsg, content: nextContent }];
        });
      }, 30); 
      
      return () => clearInterval(interval);
    }
  }, [isOpen, language, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Also scroll when loading state changes

  const handleSuggestionClick = (question: string) => {
    if (isLoading) return;
    submitMessage(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    submitMessage(input.trim());
  };

  const submitMessage = async (userMessage: string) => {
    setInput('');
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const payload = { 
        messages: newMessages, 
        language,
        user: user ? {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        } : null
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = 'Network response was not ok';
        try {
          const parsed = JSON.parse(errorText);
          errMsg = parsed.error || errMsg;
        } catch (e) {
          errMsg = errorText;
        }
        throw new Error(errMsg);
      }
      
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);
      setIsLoading(false); // Hide the spinner as soon as we start receiving text
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Smoothly type out the chunk character by character
          for (let i = 0; i < chunk.length; i++) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + chunk[i] } 
                : msg
            ));
            // 15ms delay per character for a smooth typewriter effect
            await new Promise(resolve => setTimeout(resolve, 15));
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `Error: ${error.message || 'I am having trouble connecting right now.'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatWrapper}>
      {/* Floating Buttons */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            className={styles.floatingButtonsContainer}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, pointerEvents: 'none' }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <motion.button 
              className={styles.floatingButton}
              onClick={() => setIsOpen(true)}
              aria-label="Open Chat"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare size={24} />
            </motion.button>

            <motion.a 
              href="https://wa.me/919585992141?text=Hi%20Sakthi,%20I'd%20like%20to%20discuss%20a%20project!"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className={`${styles.floatingButton} ${styles.whatsappFloating}`}
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 40, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, pointerEvents: 'none' }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <Bot size={20} className={styles.headerIcon} />
            <div>
              <h3 className={styles.headerTitle}>Sakthi Speaks AI</h3>
              <span className={styles.headerSubtitle}>
                <span className={styles.onlineDot}></span> 
                <span className={styles.onlineText}>Online</span> • <span className={styles.repliesText}>Replies instantly</span>
              </span>
            </div>
          </div>
          <motion.button 
            className={styles.closeButton} 
            onClick={() => setIsOpen(false)}
            aria-label="Close Chat"
            whileHover={{ rotate: 90, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper}`}
              initial={{ opacity: 0, y: 15, scale: 0.95, originX: msg.role === 'user' ? 1 : 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {msg.role === 'assistant' && (
                <div className={styles.avatar}>
                  <Bot size={16} />
                </div>
              )}
              <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              className={`${styles.messageWrapper} ${styles.assistantWrapper}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.avatar}>
                <Bot size={16} />
              </div>
              <div className={`${styles.message} ${styles.assistantMessage} ${styles.loadingMessage}`}>
                <Loader2 size={16} className={styles.spinner} />
                <span>{t('chat.thinking')}</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && !isLoading && (
          <div className={styles.suggestionsContainer}>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <motion.button 
                key={idx} 
                className={styles.suggestionPill} 
                onClick={() => handleSuggestionClick(q)}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            className={styles.input}
          />
          <motion.button 
            type="submit" 
            className={styles.sendButton}
            aria-label="Send Message"
            disabled={!input.trim() || isLoading}
            whileHover={!input.trim() || isLoading ? {} : { scale: 1.1, x: 2 }}
            whileTap={!input.trim() || isLoading ? {} : { scale: 0.9 }}
          >
            <Send size={18} />
          </motion.button>
        </form>

        {/* WhatsApp Link */}
        <motion.a 
          href="https://wa.me/919585992141?text=Hi%20Sakthi,%20I'd%20like%20to%20discuss%20a%20project!" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Chat on WhatsApp"
          className={styles.whatsappLink}
          whileHover={{ backgroundColor: "rgba(37, 211, 102, 0.15)" }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={styles.waIcon}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          Prefer a human? Chat on WhatsApp &rarr;
        </motion.a>
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
