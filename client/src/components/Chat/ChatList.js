import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseJwt } from '../../utils/jwt';
import Chat from '../Chat/Chat';
import '../Doctor/dashboard.css';
import '../Chat/chat.css';
import axios from 'axios';

const ChatList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
//   const userId = useMemo(() => parseJwt(token)?.id, [token]);
  const userId = '688f1945294fc4e52a0d674f';
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userId) navigate('/login');
    fetchChats();
    // eslint-disable-next-line
  }, [userId]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/user/${userId}`);
      setChats(res.data.chats);
    } catch (err) {
      setChats([]);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    // Find the other participant's name (fetch if needed)
    const otherId = chat.participants.find(id => id !== userId);
    try {
      const res = await axios.get(`http://localhost:5000/api/doctor/${otherId}`);
      setOtherUserName(res.data.name || 'User');
    } catch {
      setOtherUserName('User');
    }
  };

  return (
    <div className="chat-main-layout">
      <div className="chat-sidebar">
        <div className="chat-search-bar">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="chat-list">
          {chats.filter(chat =>
            !search || chat.participants.some(p => p.includes(search))
          ).map(chat => (
            <div
              key={chat._id}
              className={`chat-list-item${selectedChat && selectedChat._id === chat._id ? ' active' : ''}`}
              onClick={() => handleSelectChat(chat)}
            >
              <div className="chat-list-avatar">{chat.participants.find(id => id !== userId)?.slice(0, 2).toUpperCase()}</div>
              <div className="chat-list-info">
                <div className="chat-list-title">Chat</div>
                <div className="chat-list-last">{chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages yet.'}</div>
              </div>
              {chat.messages.length > 0 && <div className="chat-list-time">{new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main-content">
        {selectedChat ? (
          <Chat chatId={selectedChat._id} userId={userId} otherUserName={otherUserName} />
        ) : (
          <div className="chat-placeholder">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
