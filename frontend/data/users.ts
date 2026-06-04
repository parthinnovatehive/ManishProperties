export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'user' | 'agent' | 'admin' | 'super-admin';
  status: 'active' | 'suspended';
  joinedDate: string;
  savedProperties: number[]; // property IDs
}

export const users: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "user@estateelite.com",
    phone: "+91 98765 00001",
    avatar: "JD",
    role: "user",
    status: "active",
    joinedDate: "15 Jan 2026",
    savedProperties: [1, 2, 4],
  },
  {
    id: "u2",
    name: "Alice Cooper",
    email: "alice@example.com",
    phone: "+91 98765 00002",
    avatar: "AC",
    role: "user",
    status: "active",
    joinedDate: "20 Feb 2026",
    savedProperties: [3, 5],
  },
  {
    id: "u3",
    name: "Bob Dylan",
    email: "bob@example.com",
    phone: "+91 98765 00003",
    avatar: "BD",
    role: "user",
    status: "active",
    joinedDate: "10 Mar 2026",
    savedProperties: [1, 6],
  },
  {
    id: "u4",
    name: "Charlie Brown",
    email: "charlie@example.com",
    phone: "+91 98765 00004",
    avatar: "CB",
    role: "user",
    status: "suspended",
    joinedDate: "05 Apr 2026",
    savedProperties: [],
  }
];
