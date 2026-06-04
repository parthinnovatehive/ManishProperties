import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  sender: "agent" | "client";
  text: string;
  timestamp: string;
}

export interface ChatContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  online?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ContactItemProps {
  contact: ChatContact;
  isActive: boolean;
  onClick: () => void;
}

export function ContactItem({ contact, isActive, onClick }: ContactItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3.5 rounded-xl transition text-left border-b border-estate-border/30 last:border-b-0",
        isActive ? "bg-estate-blue-pale/80 text-estate-navy" : "hover:bg-estate-surface/40 text-estate-text"
      )}
    >
      {/* Avatar & Online status indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-estate-navy-light/20 text-estate-navy font-bold flex items-center justify-center text-sm border border-estate-border-med">
          {contact.avatar}
        </div>
        {contact.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-estate-success border-2 border-white rounded-full" />
        )}
      </div>

      {/* Info preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-extrabold text-sm truncate">{contact.name}</span>
          <span className="text-[10px] text-estate-muted whitespace-nowrap font-medium">
            {contact.lastMessageTime}
          </span>
        </div>
        <p className={cn("text-xs truncate mt-0.5", contact.unreadCount > 0 ? "font-bold text-estate-navy" : "text-estate-text-sec")}>
          {contact.lastMessage}
        </p>
      </div>

      {/* Unread badge count */}
      {contact.unreadCount > 0 && !isActive && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-estate-amber text-estate-navy text-[10px] font-extrabold flex items-center justify-center px-1 shadow-sm">
          {contact.unreadCount}
        </span>
      )}
    </button>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.sender === "agent";

  return (
    <div className={cn("flex flex-col max-w-[75%]", isAgent ? "self-end items-end" : "self-start items-start")}>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed",
          isAgent
            ? "bg-estate-navy text-white rounded-tr-none font-medium"
            : "bg-white text-estate-text border border-estate-border rounded-tl-none font-medium"
        )}
      >
        {message.text}
      </div>
      <span className="text-[10px] text-estate-muted font-medium mt-1 px-1">
        {message.timestamp}
      </span>
    </div>
  );
}
