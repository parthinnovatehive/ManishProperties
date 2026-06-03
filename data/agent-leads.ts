export interface Lead {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  propertyTitle: string;
  budget: string;
  status: "New" | "Contacted" | "Interested" | "Closed";
  date: string;
  notes?: string;
}

export const agentLeads: Lead[] = [
  {
    id: "lead-1",
    clientName: "Aditya Roy",
    email: "aditya.roy@example.com",
    phone: "+91 98112 23344",
    propertyTitle: "Luxury Sea-View 3BHK Apartment",
    budget: "₹2.8 - 3.0 Cr",
    status: "New",
    date: "2026-06-02",
    notes: "Client is looking for sea-view properties specifically on higher floors. Ready to visit this weekend.",
  },
  {
    id: "lead-2",
    clientName: "Sandhya Iyer",
    email: "sandhya.iyer@example.com",
    phone: "+91 98877 66554",
    propertyTitle: "Modern 4BHK Independent Villa",
    budget: "₹1.8 - 2.0 Cr",
    status: "Contacted",
    date: "2026-05-30",
    notes: "Followed up via call. Requested detailed layout plans and RERA compliance verification documents.",
  },
  {
    id: "lead-3",
    clientName: "Karan Johar",
    email: "karan.j@example.com",
    phone: "+91 97766 55443",
    propertyTitle: "Ultra-Luxury Penthouse DLF Phase 5",
    budget: "₹8.0 - 9.0 Cr",
    status: "Interested",
    date: "2026-05-28",
    notes: "High intent buyer. Completed initial site visit. Currently negotiating the pricing structure with builder.",
  },
  {
    id: "lead-4",
    clientName: "Rohan Patil",
    email: "rohan.patil@example.com",
    phone: "+91 96655 44332",
    propertyTitle: "Cozy Studio near Cyber City",
    budget: "₹20,000 - 25,000/mo",
    status: "Closed",
    date: "2026-05-25",
    notes: "Rental agreement signed. Security deposit paid. Keys handed over on 1st June.",
  },
  {
    id: "lead-5",
    clientName: "Ayesha Sen",
    email: "ayesha.sen@example.com",
    phone: "+91 95544 33221",
    propertyTitle: "Elegant 3BHK Gated Residence",
    budget: "₹1.4 - 1.5 Cr",
    status: "New",
    date: "2026-06-01",
    notes: "Submitted form inquiry via website. Prefers communication over WhatsApp.",
  },
  {
    id: "lead-6",
    clientName: "Manish Malhotra",
    email: "manish.m@example.com",
    phone: "+91 94433 22110",
    propertyTitle: "Grade-A Commercial Space BKC",
    budget: "₹4.0 - 4.5 Cr",
    status: "Contacted",
    date: "2026-05-29",
    notes: "Looking to invest commercial funds. Needs details on monthly rental yield history and current tenants.",
  },
  {
    id: "lead-7",
    clientName: "Prerna Sharma",
    email: "prerna.sharma@example.com",
    phone: "+91 93322 11009",
    propertyTitle: "Premium 2BHK in Hinjewadi",
    budget: "₹35,000 - 42,000/mo",
    status: "Interested",
    date: "2026-05-31",
    notes: "Expressed interest in renting Hinjewadi apartment. Asked if landlord allows pets. Site visit scheduled for today.",
  }
];
