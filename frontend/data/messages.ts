export interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  avatar: string;
  content: string;
  timestamp: string;
  isAgent: boolean;
}

export interface Conversation {
  id: string;
  userName: string;
  userEmail: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: "conv1",
    userName: "John Doe",
    userEmail: "user@estateelite.com",
    avatar: "JD",
    lastMessage: "Is the price negotiable for the sea-view apartment?",
    lastMessageTime: "10:30 AM",
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        senderName: "John Doe",
        senderEmail: "user@estateelite.com",
        avatar: "JD",
        content: "Hello, I wanted to inquire about the Luxury Sea-View 3BHK Apartment in Worli.",
        timestamp: "09:45 AM",
        isAgent: false,
      },
      {
        id: "m2",
        senderName: "Rahul Sharma",
        senderEmail: "agent@estateelite.com",
        avatar: "RS",
        content: "Hi John! Sure, it is a magnificent property. What details would you like to know?",
        timestamp: "10:00 AM",
        isAgent: true,
      },
      {
        id: "m3",
        senderName: "John Doe",
        senderEmail: "user@estateelite.com",
        avatar: "JD",
        content: "Is the price negotiable for the sea-view apartment?",
        timestamp: "10:30 AM",
        isAgent: false,
      }
    ]
  },
  {
    id: "conv2",
    userName: "Alice Cooper",
    userEmail: "alice@example.com",
    avatar: "AC",
    lastMessage: "Great, see you on Tuesday at 10 AM.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m4",
        senderName: "Alice Cooper",
        senderEmail: "alice@example.com",
        avatar: "AC",
        content: "Can we schedule a visit to the Bangalore villa next week?",
        timestamp: "Monday, 02:00 PM",
        isAgent: false,
      },
      {
        id: "m5",
        senderName: "Rahul Sharma",
        senderEmail: "agent@estateelite.com",
        avatar: "RS",
        content: "Absolutely. Tuesday at 10:00 AM works well. I'll arrange it with the owner.",
        timestamp: "Monday, 02:30 PM",
        isAgent: true,
      },
      {
        id: "m6",
        senderName: "Alice Cooper",
        senderEmail: "alice@example.com",
        avatar: "AC",
        content: "Great, see you on Tuesday at 10 AM.",
        timestamp: "Monday, 03:00 PM",
        isAgent: false,
      }
    ]
  },
  {
    id: "conv3",
    userName: "Bob Dylan",
    userEmail: "bob@example.com",
    avatar: "BD",
    lastMessage: "I sent over the documents you requested.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m7",
        senderName: "Bob Dylan",
        senderEmail: "bob@example.com",
        avatar: "BD",
        content: "I sent over the documents you requested.",
        timestamp: "31 May, 04:15 PM",
        isAgent: false,
      }
    ]
  }
];
