import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, User, CheckCheck, Clock } from 'lucide-react';
import { socket } from '../App';

const QUICK_REPLIES = [
  "I'm at the pickup point",
  "Waiting right outside",
  "Traffic is a bit heavy here",
  "On my way out now!"
];

const ChatModal = ({ ride, onClose }) => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'driver', text: "Hello Amina! I'm en route in a Toyota Corolla. ETA 3 mins.", time: 'Just now' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const driverName = ride?.driverName || 'Ibrahim Danladi';
  const rideId = ride?.id || 'ride_101';

  useEffect(() => {
    // Fetch initial chat
    fetch(`/api/messages/${rideId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.length > 0) {
          setMessages(json.data);
        }
      })
      .catch(err => console.error(err));

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('new_chat_message', handleNewMessage);
    return () => {
      socket.off('new_chat_message', handleNewMessage);
    };
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId,
          sender: 'passenger',
          text
        })
      });
      const json = await res.json();
      if (json.success) {
        setInputText('');
      }
    } catch (err) {
      console.error('Send message err:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.88)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '400px',
        height: '82vh',
        maxHeight: '620px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(14, 19, 31, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '2px solid var(--aber-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--aber-yellow)'
            }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{driverName}</div>
              <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                Online • Assigned Driver
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a 
              href="tel:+2348031112233" 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 212, 40, 0.15)',
                color: 'var(--aber-yellow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
            >
              <Phone size={16} />
            </a>
            <button 
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 10px', borderRadius: '10px' }}>
              🔒 End-to-end trip message session
            </span>
          </div>

          {messages.map((m, idx) => {
            const isMe = m.sender === 'passenger';
            return (
              <div 
                key={m.id || idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'var(--aber-yellow)' : 'var(--bg-surface-elevated)',
                  color: isMe ? '#0E131F' : '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: isMe ? '600' : '500',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {m.time} {isMe && <CheckCheck size={12} color="var(--aber-yellow)" />}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div style={{
          padding: '8px 14px',
          background: 'rgba(14, 19, 31, 0.5)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto'
        }}>
          {QUICK_REPLIES.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qr)}
              style={{
                padding: '5px 10px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          style={{
            padding: '12px 16px',
            background: 'rgba(14, 19, 31, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '8px'
          }}
        >
          <input 
            type="text"
            placeholder="Type a message to driver..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || loading}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--aber-yellow)',
              border: 'none',
              color: '#0E131F',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 212, 40, 0.4)'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
