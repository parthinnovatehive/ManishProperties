"use client";

import { useState, useRef, useEffect } from "react";
import { ContactItem, MessageBubble, type ChatContact, type ChatMessage } from "@/components/agent/MessageCard";
import { estateApi } from "@/lib/api";
import { Search, Send, Phone, Mail, User, Info, ArrowLeft } from "lucide-react";

export default function AgentMessagesPage() {
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  const [mobileShowChat, setMobileShowChat] = useState(false); // Mobile toggle

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    estateApi.messages.list<any>().then((items) => {
      const normalized = items.map((item) => ({
        id: item.id,
        name: item.name || item.userName,
        email: item.email || item.userEmail,
        phone: item.phone || item.userPhone,
        avatar: item.avatar || (item.userName || "U").slice(0, 2).toUpperCase(),
        online: item.online || false,
        lastMessage: item.lastMessage || "",
        lastMessageTime: item.lastMessageTime || "",
        unreadCount: item.unreadCount || 0,
        messages: (item.messages || []).map((message: any) => ({
          id: message.id,
          sender: message.isAgent ? "agent" : message.sender || "client",
          text: message.text || message.content,
          timestamp: message.timestamp,
        })),
      }));
      setChats(normalized);
      setActiveChatId(normalized[0]?.id || "");
    });
  }, []);

  // Active chat calculation
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Search logic
  const filteredContacts = chats.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll to bottom on load/new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatId, chats]);

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    // Update active chat messages
    const nextChats = chats.map((chat) => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: newMessage.text,
          lastMessageTime: newMessage.timestamp,
          unreadCount: 0,
          messages: [...chat.messages, newMessage],
        };
      }
      return chat;
    });
    setChats(nextChats);
    const updatedChat = nextChats.find((chat) => chat.id === activeChatId);
    if (updatedChat) {
      await estateApi.messages.update(activeChatId, updatedChat);
    }

    setInputMessage("");

  };

  if (!activeChat) {
    return (
      <div className="bg-white border border-estate-border/80 rounded-[20px] shadow-estate h-[calc(100vh-180px)] min-h-[500px] flex items-center justify-center text-sm font-semibold text-estate-muted">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="bg-white border border-estate-border/80 rounded-[20px] shadow-estate h-[calc(100vh-180px)] min-h-[500px] flex overflow-hidden animate-fade-up">
      {/* Contact sidebar list (hide on mobile if chat is active) */}
      <div
        className={`w-full md:w-80 border-r border-estate-border/80 flex flex-col flex-shrink-0 ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-estate-border/80 bg-estate-surface/10">
          <h3 className="font-extrabold text-base text-estate-navy font-serif">Inbox Chat</h3>
          <div className="relative mt-3">
            <Search className="w-4 h-4 text-estate-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-estate-border/80 focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 rounded-xl outline-none transition bg-estate-bg"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto divide-y divide-estate-border/20 p-2 space-y-0.5">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isActive={contact.id === activeChatId}
                onClick={() => {
                  setActiveChatId(contact.id);
                  setMobileShowChat(true);
                  // Reset unread count locally when active
                  setChats((prev) =>
                    prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
              />
            ))
          ) : (
            <div className="p-8 text-center text-xs text-estate-muted font-bold">
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* Conversation Chat Window (hide on mobile if showing list) */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-estate-surface/20 ${
          mobileShowChat ? "flex" : "hidden md:flex"
        }`}
      >
        {/* Chat Window Header */}
        <div className="h-16 px-6 border-b border-estate-border/80 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back button on mobile */}
            <button
              onClick={() => setMobileShowChat(false)}
              className="md:hidden p-1.5 text-estate-text-sec hover:text-estate-navy rounded-lg hover:bg-estate-surface/60 transition -ml-1 mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-estate-navy text-white flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0 relative">
              {activeChat.avatar}
              {activeChat.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-estate-success border border-white rounded-full" />
              )}
            </div>

            {/* Name Details */}
            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-estate-navy tracking-tight truncate leading-tight">
                {activeChat.name}
              </h4>
              <p className="text-[10px] text-estate-muted font-medium truncate mt-0.5">
                {activeChat.online ? "Online now" : "Offline"}
              </p>
            </div>
          </div>

          {/* Details actions */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${activeChat.phone}`}
              className="p-2 border border-estate-border hover:bg-estate-surface rounded-xl text-estate-navy transition hidden sm:inline-flex"
              title="Call client"
            >
              <Phone className="w-4 h-4 text-estate-navy-light" />
            </a>
            <a
              href={`mailto:${activeChat.email}`}
              className="p-2 border border-estate-border hover:bg-estate-surface rounded-xl text-estate-navy transition hidden sm:inline-flex"
              title="Email client"
            >
              <Mail className="w-4 h-4 text-estate-navy-light" />
            </a>
          </div>
        </div>

        {/* Messaging bubble feed */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin bg-estate-bg/40">
          {activeChat.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message editor footer input */}
        <div className="p-4 border-t border-estate-border/80 bg-white flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder={`Send message to ${activeChat.name}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-3 bg-estate-navy hover:bg-estate-navy-mid text-white rounded-xl shadow-estate transition flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
