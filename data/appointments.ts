export interface Appointment {
  id: string;
  propertyId: number;
  propertyName: string;
  userId: string;
  userName: string;
  agentName: string;
  agentEmail: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Scheduled';
  type: 'In-Person' | 'Video Call';
}

export const appointments: Appointment[] = [
  {
    id: "apt1",
    propertyId: 1,
    propertyName: "Luxury Sea-View 3BHK Apartment",
    userId: "u1",
    userName: "John Doe",
    agentName: "Rahul Sharma",
    agentEmail: "agent@estateelite.com",
    date: "12 Aug 2026",
    time: "11:00 AM",
    status: "Confirmed",
    type: "In-Person",
  },
  {
    id: "apt2",
    propertyId: 3,
    propertyName: "Premium 2BHK in Koregaon Park",
    userId: "u1",
    userName: "John Doe",
    agentName: "Amit Kulkarni",
    agentEmail: "amit@estateelite.in",
    date: "15 Aug 2026",
    time: "03:30 PM",
    status: "Scheduled",
    type: "Video Call",
  },
  {
    id: "apt3",
    propertyId: 2,
    propertyName: "Modern 4BHK Independent Villa",
    userId: "u2",
    userName: "Alice Cooper",
    agentName: "Priya Mehta",
    agentEmail: "priya@estateelite.in",
    date: "18 Aug 2026",
    time: "10:00 AM",
    status: "Pending",
    type: "In-Person",
  },
  {
    id: "apt4",
    propertyId: 4,
    propertyName: "Ultra-Luxury Penthouse",
    userId: "u3",
    userName: "Bob Dylan",
    agentName: "Vikram Singh",
    agentEmail: "vikram@estateelite.in",
    date: "20 Aug 2026",
    time: "04:00 PM",
    status: "Confirmed",
    type: "In-Person",
  },
  {
    id: "apt5",
    propertyId: 5,
    propertyName: "Smart Studio near HITEC City",
    userId: "u2",
    userName: "Alice Cooper",
    agentName: "Sneha Reddy",
    agentEmail: "sneha@estateelite.in",
    date: "22 Aug 2026",
    time: "02:00 PM",
    status: "Cancelled",
    type: "Video Call",
  }
];
