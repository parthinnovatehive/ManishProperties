// lib/adminMock.ts
export const adminStats = {
  totalUsers: 1245,
  totalAgents: 87,
  pendingProperties: 23,
  activeListings: 342,
  openComplaints: 5,
  appointmentsToday: 12,
};

export const pendingProperties = [
  { id: 1, title: "Modern Apartment", location: "Mumbai", price: "$120,000" },
  { id: 2, title: "Beach House", location: "Goa", price: "$250,000" },
  // add more mock rows as needed
];

export const users = [
  { id: 1, name: "Alice", email: "alice@example.com", complaints: 1 },
  { id: 2, name: "Bob", email: "bob@example.com", complaints: 0 },
];

export const agents = [
  { id: 1, name: "Agent Smith", assigned: 5 },
  { id: 2, name: "Agent Jane", assigned: 3 },
];

export const complaints = [
  { id: 1, user: "Alice", issue: "Leaky faucet", status: "Open" },
  { id: 2, user: "Bob", issue: "Missing documents", status: "In Progress" },
];

export const appointments = [
  { id: 1, user: "Alice", property: "Modern Apartment", date: "2023-09-12" },
  { id: 2, user: "Bob", property: "Beach House", date: "2023-09-13" },
];
