export interface ChatMessage {
  id: string;
  sender: "agent" | "client";
  text: string;
  timestamp: string; // HH:MM
}

export interface ChatContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string; // Initials or short name
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: ChatMessage[];
}

export const agentChats: ChatContact[] = [
  {
    id: "chat-1",
    name: "Aditya Roy",
    email: "aditya.roy@example.com",
    phone: "+91 98112 23344",
    avatar: "AR",
    lastMessage: "Shall we meet at 11 AM tomorrow at the Worli site?",
    lastMessageTime: "10:14 AM",
    unreadCount: 2,
    online: true,
    messages: [
      {
        id: "m1",
        sender: "client",
        text: "Hi Rahul, I saw the Luxury Sea-View 3BHK listing online. Is it still available?",
        timestamp: "Yesterday, 04:30 PM",
      },
      {
        id: "m2",
        sender: "agent",
        text: "Hello Aditya! Yes, the 3BHK apartment in Worli is still available. It's on the 28th floor with amazing sea views. Would you like to schedule a site visit?",
        timestamp: "Yesterday, 04:45 PM",
      },
      {
        id: "m3",
        sender: "client",
        text: "Yes, definitely. I would love to check out the flat in person. Can we do this Thursday?",
        timestamp: "Yesterday, 05:02 PM",
      },
      {
        id: "m4",
        sender: "agent",
        text: "Sure! I have slots open on Thursday (tomorrow) at 11:00 AM or 3:00 PM. Which works better for you?",
        timestamp: "09:30 AM",
      },
      {
        id: "m5",
        sender: "client",
        text: "11:00 AM works perfectly for me. Please share the exact coordinates of the entry gate.",
        timestamp: "10:02 AM",
      },
      {
        id: "m6",
        sender: "client",
        text: "Shall we meet at 11 AM tomorrow at the Worli site?",
        timestamp: "10:14 AM",
      }
    ],
  },
  {
    id: "chat-2",
    name: "Prerna Sharma",
    email: "prerna.sharma@example.com",
    phone: "+91 93322 11009",
    avatar: "PS",
    lastMessage: "I am near the gate now, see you in 5 minutes.",
    lastMessageTime: "02:15 PM",
    unreadCount: 0,
    online: true,
    messages: [
      {
        id: "m7",
        sender: "client",
        text: "Hi Rahul, just wanted to confirm our site visit for the Hinjewadi 2BHK today at 2:30 PM.",
        timestamp: "11:15 AM",
      },
      {
        id: "m8",
        sender: "agent",
        text: "Hi Prerna! Yes, our visit is confirmed. I am already on my way to the property and will be there by 2:15 PM.",
        timestamp: "11:30 AM",
      },
      {
        id: "m9",
        sender: "client",
        text: "Great. Is parking available in the building for visitors?",
        timestamp: "11:45 AM",
      },
      {
        id: "m10",
        sender: "agent",
        text: "Yes, visitor parking is available inside. Just tell the security guard at the gate that you're visiting Flat 1102.",
        timestamp: "12:00 PM",
      },
      {
        id: "m11",
        sender: "client",
        text: "I am near the gate now, see you in 5 minutes.",
        timestamp: "02:15 PM",
      }
    ],
  },
  {
    id: "chat-3",
    name: "Karan Johar",
    email: "karan.j@example.com",
    phone: "+91 97766 55443",
    avatar: "KJ",
    lastMessage: "Thanks, I will review the quote with my lawyer today.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: "m12",
        sender: "agent",
        text: "Hi Karan, here is the price sheet for the DLF Phase 5 Penthouse with the customized payment plan we discussed.",
        timestamp: "Tuesday, 10:00 AM",
      },
      {
        id: "m13",
        sender: "client",
        text: "Thanks, I will review the quote with my lawyer today.",
        timestamp: "Tuesday, 04:50 PM",
      }
    ],
  },
  {
    id: "chat-4",
    name: "Sandhya Iyer",
    email: "sandhya.iyer@example.com",
    phone: "+91 98877 66554",
    avatar: "SI",
    lastMessage: "Could you send the RERA registration certificate PDF?",
    lastMessageTime: "3 days ago",
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: "m14",
        sender: "client",
        text: "Hi Rahul, thank you for showing us the villa in Whitefield. We liked the garden area.",
        timestamp: "28 May, 06:12 PM",
      },
      {
        id: "m15",
        sender: "agent",
        text: "It was a pleasure meeting you and your family, Sandhya. Let me know if you need any other documents.",
        timestamp: "28 May, 06:30 PM",
      },
      {
        id: "m16",
        sender: "client",
        text: "Could you send the RERA registration certificate PDF?",
        timestamp: "29 May, 10:05 AM",
      }
    ],
  }
];
