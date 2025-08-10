import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chat.css';

const Chat = ({ chatId, userId, otherUserName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId) fetchMessages();
    // Optionally, add polling or websockets for real-time
    // eslint-disable-next-line
  }, [chatId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${chatId}/messages`);
      setMessages(res.data.messages);
    } catch (err) {
      setMessages([]);
    }
    setLoading(false);
    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/chat/${chatId}/message`, {
        senderId: userId,
        content: input
      });
      setInput('');
      fetchMessages();
    } catch (err) {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat with {otherUserName}</div>
      <div className="chat-messages">
        {loading ? <div className="chat-loading">Loading...</div> :
          messages.length === 0 ? <div className="chat-empty">No messages yet.</div> :
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.senderId === userId ? 'chat-message-own' : 'chat-message-other'}`}
            >
              <span>{msg.content}</span>
              <div className="chat-message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))
        }
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
