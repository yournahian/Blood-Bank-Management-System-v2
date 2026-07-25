'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Send, User, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
import { getStock, addTransaction, deleteDonor } from '@/utils/dbManager';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionUrl?: string;
  actionLabel?: string;
  isActionSuccess?: boolean;
}

export default function HelpDeskPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your Actionable AI Assistant. You can ask me questions, or tell me to perform tasks like:\n\n- "How much O+ do we have?"\n- "Request 2 units of A-" (Hospital Role)\n- "Delete donor 5"',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Wait a brief moment to simulate typing
    setTimeout(async () => {
      const botResponse = await generateBotAnswer(userMsgText);
      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  const generateBotAnswer = async (query: string): Promise<ChatMessage> => {
    const q = query.toLowerCase();

    // ============================================
    // ACTION 1: Check Stock
    // ============================================
    const stockMatch = query.match(/(?:how much|check|stock|inventory).*?([ABO][+-]|AB[+-])/i);
    if (stockMatch && (q.includes('stock') || q.includes('much') || q.includes('inventory') || q.includes('check'))) {
      const bg = stockMatch[1].toUpperCase();
      try {
        const stockList = await getStock();
        const item = stockList.find(s => s.bloodGroup === bg);
        if (item) {
          return {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `We currently have **${item.units} units** of ${bg} available in the central inventory.`,
            isActionSuccess: true
          };
        }
      } catch (err) {
        console.error(err);
      }
    }

    // ============================================
    // ACTION 2: Request Blood
    // ============================================
    const reqMatch = query.match(/(?:request|need|order)\s+(\d+)\s+units?(?:\s+of)?\s+([ABO][+-]|AB[+-])/i);
    if (reqMatch) {
      const units = parseInt(reqMatch[1], 10);
      const bg = reqMatch[2].toUpperCase();
      const role = localStorage.getItem('bbms_role') || 'admin';
      
      try {
        if (role === 'hospital') {
          const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
          await addTransaction({
            patientName: 'Agent Request',
            hospitalName: 'Hospital Portal (Agent)',
            bloodGroup: bg,
            units: units,
            date: todayDate,
            status: 'PENDING'
          });
          return {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Success! I have submitted a pending request for ${units} unit(s) of ${bg} to the Admin queue.`,
            isActionSuccess: true
          };
        } else {
          return {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `You are logged in as Admin. You cannot request blood from yourself through the chat. Try logging in as a Hospital first.`,
          };
        }
      } catch (err: any) {
        return {
           id: (Date.now() + 1).toString(),
           sender: 'bot',
           text: `Failed to create request: ${err.message}`
        };
      }
    }

    // ============================================
    // ACTION 3: Delete Donor
    // ============================================
    const delMatch = query.match(/(?:delete|remove)\s+donor\s+(?:id\s+)?(\d+)/i);
    if (delMatch) {
      const id = parseInt(delMatch[1], 10);
      try {
        const res = await deleteDonor(id);
        if (res) {
          return {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Action executed! Donor #${id} has been permanently deleted from the database.`,
            isActionSuccess: true
          };
        } else {
          return {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Could not execute action. Donor #${id} might not exist.`
          };
        }
      } catch(e) {
        console.error(e);
      }
    }

    // ============================================
    // FALLBACKS (Navigation Instructions)
    // ============================================
    if (q.includes('add') || q.includes('new donor') || q.includes('register')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'To register a new blood donor manually, click on "Add New Donor" in the sidebar menu.',
        actionUrl: '/dashboard/donors/add',
        actionLabel: 'Go to Add New Donor',
      };
    }

    if (q.includes('match') || q.includes('intelligent') || q.includes('score') || q.includes('ai')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Our AI Intelligent Matcher evaluates 90-day recovery eligibility, city proximity, and blood group compatibility scores.',
        actionUrl: '/dashboard/search/matcher',
        actionLabel: 'Run Intelligent Matcher',
      };
    }

    if (q.includes('stock') || q.includes('units') || q.includes('inventory')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'To manage blood stock levels (+/- units), visit "Manage Stock" under the STOCK section.',
        actionUrl: '/dashboard/stock/manage',
        actionLabel: 'Go to Manage Stock',
      };
    }

    return {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: `I couldn't identify a specific action for "${query}". Try phrasing requests like "Request 2 units of A+" or "Delete donor 5".`,
    };
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div className="app-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#6c63ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.2 }}>
              Actionable Chat Agent
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              This AI can perform database actions on your behalf
            </span>
          </div>
        </div>

        {/* Chat Stream */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', backgroundColor: 'var(--bg-card-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6c63ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  maxWidth: '75%',
                  backgroundColor: msg.sender === 'user' 
                    ? '#6c63ff' 
                    : (msg.isActionSuccess ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-card)'),
                  color: msg.sender === 'user' 
                    ? '#ffffff' 
                    : (msg.isActionSuccess ? '#16a34a' : 'var(--text-main)'),
                  padding: '0.875rem 1.125rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  boxShadow: 'var(--shadow-sm)',
                  border: msg.sender === 'bot' 
                    ? (msg.isActionSuccess ? '1px solid #16a34a' : '1px solid var(--border-color)') 
                    : 'none',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}
              >
                {msg.isActionSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <CheckCircle2 size={16} /> Action Executed
                  </div>
                )}
                
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontWeight: msg.isActionSuccess ? 600 : 400 }}>
                  {msg.text.split('**').map((part, i) => (
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  ))}
                </p>

                {msg.actionUrl && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderRadius: '6px' }}
                      onClick={() => router.push(msg.actionUrl!)}
                    >
                      <Navigation size={12} />
                      {msg.actionLabel}
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', backgroundColor: 'var(--bg-card)' }}>
          <input
            type="text"
            className="form-input"
            style={{ borderRadius: '24px', paddingLeft: '1.25rem' }}
            placeholder="Tell me to perform an action..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.625rem 1.5rem' }}>
            <Send size={16} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
