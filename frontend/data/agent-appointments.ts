export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  status: "Confirmed" | "Pending" | "Completed";
  type: "Site Visit" | "Online Consultation" | "Agreement Review";
}

export const agentAppointments: Appointment[] = [
  {
    id: "app-1",
    clientName: "Prerna Sharma",
    clientEmail: "prerna.sharma@example.com",
    clientPhone: "+91 93322 11009",
    propertyName: "Premium 2BHK in Hinjewadi",
    date: "2026-06-03", // Today
    time: "02:30 PM",
    status: "Confirmed",
    type: "Site Visit",
  },
  {
    id: "app-2",
    clientName: "Aditya Roy",
    clientEmail: "aditya.roy@example.com",
    clientPhone: "+91 98112 23344",
    propertyName: "Luxury Sea-View 3BHK Apartment",
    date: "2026-06-04",
    time: "11:00 AM",
    status: "Confirmed",
    type: "Site Visit",
  },
  {
    id: "app-3",
    clientName: "Ayesha Sen",
    clientEmail: "ayesha.sen@example.com",
    clientPhone: "+91 95544 33221",
    propertyName: "Elegant 3BHK Gated Residence",
    date: "2026-06-05",
    time: "04:00 PM",
    status: "Pending",
    type: "Online Consultation",
  },
  {
    id: "app-4",
    clientName: "Manish Malhotra",
    clientEmail: "manish.m@example.com",
    clientPhone: "+91 94433 22110",
    propertyName: "Grade-A Commercial Space BKC",
    date: "2026-06-06",
    time: "12:30 PM",
    status: "Pending",
    type: "Agreement Review",
  },
  {
    id: "app-5",
    clientName: "Rohan Patil",
    clientEmail: "rohan.patil@example.com",
    clientPhone: "+91 96655 44332",
    propertyName: "Cozy Studio near Cyber City",
    date: "2026-06-01",
    time: "03:00 PM",
    status: "Completed",
    type: "Site Visit",
  },
  {
    id: "app-6",
    clientName: "Karan Johar",
    clientEmail: "karan.j@example.com",
    clientPhone: "+91 97766 55443",
    propertyName: "Ultra-Luxury Penthouse DLF Phase 5",
    date: "2026-05-28",
    time: "10:30 AM",
    status: "Completed",
    type: "Site Visit",
  }
];
