import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Components & Styles
import Chat from '../Chat/Chat';
import PageLayout from '../Common/PageLayout';
import { useToast } from '../Common/ToastContext';
import '../Chat/chat.css';
import './chatlist.css';

// Initialize Socket connection
const socket = io.connect("http://localhost:5001");

const ChatList = () => {
  const { addToast } = useToast();
  
  // Auth & User State
  const role = localStorage.getItem('userRole'); 
  const userId = localStorage.getItem('userId');

  // Component State
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [search, setSearch] = useState('');

  const fetchChats = useCallback(async () => {
    if (!userId) {
      setChats([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5001/api/chat/user/${userId}`);
      setChats(res.data.chats);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setChats([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!userId) return undefined;

    socket.emit('join_user_room', userId);
    socket.on('request_received', fetchChats);
    socket.on('request_updated', fetchChats);

    return () => {
      socket.off('request_received', fetchChats);
      socket.off('request_updated', fetchChats);
    };
  }, [fetchChats, userId]);

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
      
      fetchChats();
      addToast('Chat request accepted!', 'success');
    } catch (err) {
      console.error("Approval failed", err);
      addToast('Failed to approve chat request', 'error');
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
    <PageLayout role={role}>
      <div className="page-content chat-page-content">
        <div className="chat-page">
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
    </PageLayout>
  );
};

export default ChatList;
