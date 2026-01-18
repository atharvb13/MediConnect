import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

// Components & Styles
import Chat from '../Chat/Chat';
import Sidebar from '../Common/Sidebar';
import '../Doctor/dashboard.css';
import '../Chat/chat.css';
import './chatlist.css';

// Initialize Socket connection
const socket = io.connect("http://localhost:5001");

const ChatList = () => {
  const navigate = useNavigate();
  
  // Auth & User State
  const role = localStorage.getItem('userRole'); 
  const userId = localStorage.getItem('userId');

  // Component State
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [search, setSearch] = useState('');

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetchChats();
    }
  }, [userId, navigate]);

  // 2. Real-time Socket Listeners
  useEffect(() => {
    if (userId) {
      // Join a private room for this specific user to receive notifications
      socket.emit('join_user_room', userId); 
      
      // Refresh list if a new request is sent to this user or an existing one is accepted
      socket.on('request_received', () => fetchChats());
      socket.on('request_updated', () => fetchChats());

      return () => {
        socket.off('request_received');
        socket.off('request_updated');
      };
    }
  }, [userId]);

  // 3. Fetch Chats (Expects backend to use .populate('participants'))
  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/chat/user/${userId}`);
      setChats(res.data.chats);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setChats([]);
    }
  };

  // 4. Handle Chat Selection (Extracts name from populated participants)
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    
    // Find the participant who is NOT the logged-in user
    const otherParticipant = chat.participants.find(p => 
      (typeof p === 'string' ? p : p._id) !== userId
    );

    // Set display name (using populated user object)
    if (otherParticipant && typeof otherParticipant === 'object') {
      setOtherUserName(otherParticipant.name);
    } else {
      setOtherUserName("User");
    }
  };

  // 5. Handle Approval (Doctor Action Only)
  const handleApprove = async (e, chatId) => {
    e.stopPropagation(); // Prevent handleSelectChat from firing
    try {
      await axios.put(`http://localhost:5001/api/chat/approve/${chatId}`);
      
      // Notify the other user via socket that the status has changed
      socket.emit('accept_request', { chatId });
      
      fetchChats(); // Refresh local UI
      alert("Chat request accepted!");
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  // 6. Search Filter
  const filteredChats = chats.filter((chat) => {
    const otherParticipant = chat.participants.find(p => 
      (typeof p === 'string' ? p : p._id) !== userId
    );
    const displayName = otherParticipant?.name || "";
    return displayName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar role={role} />
      
      <div style={{ flex: 1 }}>
        <div className="patient-dashboard-container chat-page">
          <div className="chat-page-header">
            <div className="chat-page-title">Messages</div>
          </div>

          <div className="chat-main-layout">
            {/* Left Panel: Chat List */}
            <div className="chat-sidebar">
              <div className="chat-search-bar">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="chat-list">
                {filteredChats.map((chat) => {
                  const otherUser = chat.participants.find(p => 
                    (typeof p === 'string' ? p : p._id) !== userId
                  );

                  return (
                    <div
                      key={chat._id}
                      className={`chat-list-item ${selectedChat?._id === chat._id ? 'active' : ''} ${chat.status}`}
                      onClick={() => handleSelectChat(chat)}
                    >
                      <div className="chat-list-avatar">
                        {otherUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="chat-list-info">
                        <div className="chat-list-title">
                          {otherUser?.name || "Loading..."}
                        </div>
                        
                        {chat.status === 'pending' ? (
                          <div className="pending-status">
                            {role === 'doctor' ? (
                              <button className="approve-btn" onClick={(e) => handleApprove(e, chat._id)}>
                                Accept Request
                              </button>
                            ) : (
                              <span className="wait-msg">Waiting for Approval...</span>
                            )}
                          </div>
                        ) : (
                          <div className="chat-list-last">
                            {chat.messages.length > 0 
                              ? chat.messages[chat.messages.length - 1].content 
                              : "No messages yet."}
                          </div>
                        )}
                      </div>

                      {chat.messages.length > 0 && chat.status === 'accepted' && (
                        <div className="chat-list-time">
                          {new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredChats.length === 0 && (
                  <div className="chat-list-empty">No conversations found.</div>
                )}
              </div>
            </div>

            {/* Right Panel: Active Conversation */}
            <div className="chat-main-content">
              {selectedChat ? (
                <Chat 
                  status={selectedChat.status} 
                  chatId={selectedChat._id} 
                  userId={userId} 
                  otherUserName={otherUserName} 
                />
              ) : (
                <div className="chat-placeholder-card">
                  <div className="chat-placeholder-title">Select a chat</div>
                  <div className="chat-placeholder-text">
                    Choose a conversation from the left to start messaging.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;