export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  deals: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  bio: string;
  experience: string;
  languages: string[];
}

export const agents: Agent[] = [
  {
    id: "a1",
    name: "Rahul Sharma",
    email: "agent@estateelite.com",
    phone: "+91 98765 43210",
    avatar: "RS",
    rating: 4.9,
    deals: 152,
    status: "active",
    joinedDate: "12 May 2024",
    bio: "Specializing in luxury sea-view apartments and penthouses across South Mumbai. Over 8 years of experience helping clients find their dream homes.",
    experience: "8+ Years",
    languages: ["English", "Hindi", "Marathi"]
  },
  {
    id: "a2",
    name: "Priya Mehta",
    email: "priya@estateelite.in",
    phone: "+91 99876 54321",
    avatar: "PM",
    rating: 4.8,
    deals: 89,
    status: "active",
    joinedDate: "18 Aug 2024",
    bio: "Expert in residential villas and gated communities in Whitefield, Bangalore. Focused on transparency and seamless transactions.",
    experience: "5 Years",
    languages: ["English", "Kannada", "Hindi"]
  },
  {
    id: "a3",
    name: "Amit Kulkarni",
    email: "amit@estateelite.in",
    phone: "+91 97654 32109",
    avatar: "AK",
    rating: 4.6,
    deals: 67,
    status: "active",
    joinedDate: "05 Jan 2025",
    bio: "Focuses on premium rentals and purchases in Koregaon Park and Kalyani Nagar, Pune.",
    experience: "4 Years",
    languages: ["English", "Marathi", "Hindi"]
  },
  {
    id: "a4",
    name: "Vikram Singh",
    email: "vikram@estateelite.in",
    phone: "+91 98001 23456",
    avatar: "VS",
    rating: 5.0,
    deals: 45,
    status: "active",
    joinedDate: "22 Oct 2023",
    bio: "Ultra-luxury penthouse specialist in Gurugram. Serving high-net-worth individuals with absolute discretion and excellence.",
    experience: "10+ Years",
    languages: ["English", "Hindi", "Punjabi"]
  },
  {
    id: "a5",
    name: "Sneha Reddy",
    email: "sneha@estateelite.in",
    phone: "+91 95432 10987",
    avatar: "SR",
    rating: 4.7,
    deals: 89,
    status: "active",
    joinedDate: "14 Feb 2025",
    bio: "IT corridor residential specialist in Hyderabad. Hardworking, responsive, and detail-oriented.",
    experience: "3 Years",
    languages: ["English", "Telugu", "Hindi"]
  }
];
