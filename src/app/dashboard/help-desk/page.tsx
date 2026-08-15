'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, Send, User, Sparkles, Navigation, CheckCircle2, MapPin, 
  ExternalLink, Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft, RotateCcw
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: any[];
}

const DEFAULT_WELCOME_MSG = {
  id: 'welcome-1',
  role: 'assistant',
  content: 'Hello! I am your Actionable AI Assistant powered by an LLM. You can speak naturally without strict formatting! Try saying:\n\n- "Do we have any O+ blood available right now?"\n- "Show me info of donor id 5"\n- "Location of id 5"\n- "Check expiry"\n- "How many A+ donors do we have?"',
};

const STORAGE_KEY = 'bbms_chat_sessions_v2';
const ACTIVE_SESSION_KEY = 'bbms_active_session_id';

export default function HelpDeskPage() {
  const router = useRouter();
  const [localErr, setLocalErr] = React.useState<string | null>(null);
  const [inputText, setInputText] = React.useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const isLoadedRef = useRef(false);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    maxSteps: 5,
    initialMessages: [DEFAULT_WELCOME_MSG]
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let loadedSessions: ChatSession[] = raw ? JSON.parse(raw) : [];
      
      if (!Array.isArray(loadedSessions) || loadedSessions.length === 0) {
        const initialSession: ChatSession = {
          id: 'session_' + Date.now(),
          title: 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [DEFAULT_WELCOME_MSG]
        };
        loadedSessions = [initialSession];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedSessions));
      }

      setSessions(loadedSessions);

      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
      const targetSession = loadedSessions.find(s => s.id === savedActiveId) || loadedSessions[0];
      
      setActiveSessionId(targetSession.id);
      localStorage.setItem(ACTIVE_SESSION_KEY, targetSession.id);
      
      if (targetSession.messages && targetSession.messages.length > 0) {
        setMessages(targetSession.messages);
      }
      isLoadedRef.current = true;
    } catch (e) {
      console.error('Failed to load chat history from storage:', e);
      isLoadedRef.current = true;
    }
  }, [setMessages]);

  // 2. Auto-save messages to active session
  useEffect(() => {
    if (!isLoadedRef.current || !activeSessionId || messages.length === 0) return;

    setSessions(prevSessions => {
      const updated = prevSessions.map(session => {
        if (session.id === activeSessionId) {
          // Generate an intelligent title if it's currently default
          let title = session.title;
          if (title === 'New Chat' || title.startsWith('Chat ')) {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg && firstUserMsg.content) {
              title = firstUserMsg.content.slice(0, 30).trim() + (firstUserMsg.content.length > 30 ? '...' : '');
              title = title.charAt(0).toUpperCase() + title.slice(1);
            }
          }

          return {
            ...session,
            title,
            updatedAt: Date.now(),
            messages: messages
          };
        }
        return session;
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage quota warning when saving chat:', e);
      }
      return updated;
    });
  }, [messages, activeSessionId]);

  // 3. Switch between chat sessions
  const switchSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    const target = sessions.find(s => s.id === sessionId);
    if (!target) return;

    setActiveSessionId(sessionId);
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
    setMessages(target.messages || [DEFAULT_WELCOME_MSG]);
    setLocalErr(null);
  };

  // 4. Create a new chat session (like ChatGPT / Gemini)
  const createNewChat = () => {
    const newSessionId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [DEFAULT_WELCOME_MSG]
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_SESSION_KEY, newSessionId);

    setMessages([DEFAULT_WELCOME_MSG]);
    setInputText('');
    setLocalErr(null);
  };

  // 5. Delete a chat session
  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== sessionId);
    
    if (remaining.length === 0) {
      // Re-create a fresh default session
      const freshSession: ChatSession = {
        id: 'session_' + Date.now(),
        title: 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [DEFAULT_WELCOME_MSG]
      };
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([freshSession]));
      localStorage.setItem(ACTIVE_SESSION_KEY, freshSession.id);
      setMessages([DEFAULT_WELCOME_MSG]);
      return;
    }

    setSessions(remaining);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

    if (activeSessionId === sessionId) {
      const nextActive = remaining[0];
      setActiveSessionId(nextActive.id);
      localStorage.setItem(ACTIVE_SESSION_KEY, nextActive.id);
      setMessages(nextActive.messages || [DEFAULT_WELCOME_MSG]);
    }
  };

  // 6. Clear current chat
  const clearCurrentChat = () => {
    setMessages([DEFAULT_WELCOME_MSG]);
    setSessions(prev => {
      const updated = prev.map(s => s.id === activeSessionId ? { ...s, messages: [DEFAULT_WELCOME_MSG], title: 'New Chat' } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    setLocalErr(null);
    const isLoading = status === 'streaming' || status === 'submitted';
    if (!inputText || !inputText.trim() || isLoading) return;
    
    try {
      sendMessage({ role: 'user', content: inputText.trim() });
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      setLocalErr(err?.message || err?.toString() || 'Unknown local error');
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', gap: '1rem' }}>
      
      {/* ChatGPT / Gemini Style Sidebar */}
      {isSidebarOpen && (
        <div 
          className="app-card" 
          style={{ 
            width: '280px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '1rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            flexShrink: 0
          }}
        >
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#6c63ff',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(108, 99, 255, 0.3)',
              marginBottom: '1rem',
              transition: 'transform 0.15s, opacity 0.15s'
            }}
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>

          {/* Session List Title */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
            Saved Conversations ({sessions.length})
          </div>

          {/* Sessions List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => switchSession(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(108, 99, 255, 0.12)' : 'transparent',
                    border: isActive ? '1px solid #6c63ff' : '1px solid transparent',
                    cursor: 'pointer',
                    color: isActive ? 'var(--text-title)' : 'var(--text-main)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <MessageSquare size={15} style={{ color: isActive ? '#6c63ff' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {s.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    title="Delete Chat"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isActive ? 0.8 : 0.4,
                      transition: 'opacity 0.15s, color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="app-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>

            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#6c63ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.2 }}>
                {activeSession?.title || 'Actionable Chat Agent'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Powered by Groq LLM • Auto-saved locally
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={clearCurrentChat}
              title="Reset conversation"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>Clear Chat</span>
            </button>
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
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role !== 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6c63ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  maxWidth: '75%',
                  backgroundColor: msg.role === 'user' 
                    ? '#6c63ff' 
                    : 'var(--bg-card)',
                  color: msg.role === 'user' 
                    ? '#ffffff' 
                    : 'var(--text-main)',
                  padding: '0.875rem 1.125rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  boxShadow: 'var(--shadow-sm)',
                  border: msg.role !== 'user' 
                    ? '1px solid var(--border-color)' 
                    : 'none',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}
              >
                {/* Tool Invocations / Actions Display */}
                {msg.parts?.map((part: any, idx: number) => {
                   if (part.type?.startsWith('tool-') || part.type === 'tool-invocation' || part.type === 'tool-call') {
                      const toolName = part.toolName || (part.type?.startsWith('tool-') ? part.type.substring(5) : 'Action');
                      const isDone = part.state === 'output-available' || part.state === 'result' || part.output !== undefined;
                      const output = part.output || part.result;
                      
                      // Extract any Google Maps URL from link or message if available
                      const mapLink = output?.link || (typeof output?.message === 'string' ? output.message.match(/https:\/\/www\.google\.com\/maps[^\s\)]+/)?.[0] : null);
                      
                      return (
                         <div key={idx} style={{ marginBottom: '0.6rem', padding: '0.6rem 0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: isDone ? '#22c55e' : '#eab308' }}>
                               {isDone ? <CheckCircle2 size={15} /> : <Sparkles size={15} />}
                               <span>{isDone ? `Executed: ${toolName.replace(/_/g, ' ')}` : `Running: ${toolName.replace(/_/g, ' ')}...`}</span>
                            </div>
                            
                            {output?.message && (
                               <div style={{ fontSize: '0.82rem', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                                  {/* Strip raw url from message text if a button is displayed */}
                                  {mapLink ? output.message.replace(/https:\/\/www\.google\.com\/maps[^\s\)]+/, '').replace(/\(\s*\)/, '').trim() : output.message}
                               </div>
                            )}

                            {mapLink && (
                               <div style={{ marginTop: '0.5rem' }}>
                                  <a
                                     href={mapLink}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        textDecoration: 'none',
                                        padding: '0.45rem 0.9rem',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        borderRadius: '6px',
                                        backgroundColor: '#6c63ff',
                                        color: '#ffffff',
                                        boxShadow: '0 2px 6px rgba(108, 99, 255, 0.35)',
                                        transition: 'opacity 0.2s'
                                     }}
                                  >
                                     <MapPin size={15} />
                                     <span>Open in Google Maps</span>
                                     <ExternalLink size={13} style={{ opacity: 0.85 }} />
                                  </a>
                               </div>
                            )}

                            {output?.donor && (
                               <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', padding: '0.5rem 0.6rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                  <div><strong>Name:</strong> {output.donor.name} (#{output.donor.donorId})</div>
                                  <div><strong>Blood Group:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{output.donor.bloodGroup}</span></div>
                                  <div><strong>Phone:</strong> {output.donor.Phone}</div>
                                  <div><strong>City:</strong> {output.donor.city}</div>
                                  {output.donor.address && <div><strong>Address:</strong> {output.donor.address}</div>}
                                  <div><strong>Last Donation:</strong> {output.donor.dateOfDonation}</div>
                                  <div style={{ marginTop: '0.4rem' }}>
                                     <a
                                        href={`https://www.google.com/maps?q=${output.donor.latitude && output.donor.longitude && (output.donor.latitude !== 0 || output.donor.longitude !== 0) ? `${output.donor.latitude},${output.donor.longitude}` : encodeURIComponent(`${output.donor.address || output.donor.city}, Bangladesh`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                                     >
                                        <MapPin size={13} /> View on Google Maps <ExternalLink size={11} />
                                     </a>
                                  </div>
                               </div>
                            )}

                            {output?.stock && Array.isArray(output.stock) && (
                               <div style={{ fontSize: '0.8rem', marginTop: '0.35rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
                                  {output.stock.map((s: any, sIdx: number) => (
                                     <div key={sIdx} style={{ padding: '0.25rem 0.4rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{s.bloodGroup}:</span> {s.units}u
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                      );
                   }
                   return null;
                })}

                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                  {(() => {
                    let text = msg.content || '';
                    if (msg.role === 'assistant' && msg.parts) {
                      const textParts = msg.parts.filter((p: any) => p.type === 'text');
                      if (textParts.length > 0) {
                        text = textParts.map((p: any) => p.text).join('\n');
                      }
                    }
                    if (!text) return null;
                    return text.split('**').map((part, i) => (
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    ));
                  })()}
                </p>

              </div>

              {msg.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {status === 'streaming' && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingLeft: '2.5rem' }}>AI is thinking...</div>
          )}
          {error && (
            <div style={{ color: '#dc2626', fontSize: '0.9rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #f87171' }}>
              <strong>API Error:</strong> {error.message || 'An error occurred while communicating with the AI server.'}
            </div>
          )}
          {localErr && (
            <div style={{ color: '#dc2626', fontSize: '0.9rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #f87171' }}>
              <strong>Local Submit Error:</strong> {localErr}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={onFormSubmit} style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--bg-card)' }}>
          <textarea
            ref={textareaRef}
            rows={1}
            className="form-input"
            style={{ 
              borderRadius: '20px', 
              padding: '0.65rem 1.25rem', 
              resize: 'none', 
              minHeight: '44px',
              maxHeight: '140px',
              lineHeight: 1.4,
              fontFamily: 'inherit',
              overflowY: 'auto'
            }}
            placeholder="Type a message (Shift + Enter for new line)..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            disabled={status === 'streaming' || status === 'submitted'}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || status === 'streaming' || status === 'submitted'} 
            className="btn btn-primary" 
            style={{ 
              borderRadius: '24px', 
              height: '44px',
              padding: '0 1.4rem', 
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: (!inputText.trim() || status === 'streaming' || status === 'submitted') ? 0.6 : 1,
              flexShrink: 0
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
