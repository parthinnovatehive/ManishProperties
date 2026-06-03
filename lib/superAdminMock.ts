// lib/superAdminMock.ts
export const superAdminStats = {
  totalUsers: 1245,
  totalAgents: 87,
  totalAdmins: 12,
  totalProperties: 560,
  totalAppointments: 342,
  totalRevenue: "$4.2M",
  openComplaints: 7,
  activeCities: 5,
};

export const admins = [
  { id: 1, name: "Admin John", email: "john@estateelite.com", active: true },
  { id: 2, name: "Admin Mary", email: "mary@estateelite.com", active: false },
];

export const analytics = {
  userGrowth: [30, 45, 60, 80, 120],
  propertyGrowth: [10, 20, 30, 55, 70],
  appointmentTrends: [5, 8, 12, 20, 25],
  platformUsage: [70, 75, 80, 85, 90],
};

export const logs = {
  recentActivities: [
    { id: 1, description: "User Alice logged in", time: "2023-09-12 08:15" },
    { id: 2, description: "Property 23 approved", time: "2023-09-12 09:00" },
  ],
  loginLogs: [
    { id: 1, user: "Alice", time: "2023-09-12 08:15" },
    { id: 2, user: "Bob", time: "2023-09-12 08:45" },
  ],
  propertyApprovalLogs: [
    { id: 1, property: "Modern Apartment", action: "Approved", by: "Admin John", time: "2023-09-12 09:00" },
  ],
  complaintLogs: [
    { id: 1, complaint: "Leaky faucet", status: "Resolved", by: "Admin Mary", time: "2023-09-12 10:30" },
  ],
};

export const permissions = [
  { role: "admin", canManageUsers: true, canManageAgents: true, canApproveProperties: true },
  { role: "agent", canManageUsers: false, canManageAgents: false, canApproveProperties: false },
];

export const reports = [
  { id: 1, title: "Property Report Q3", link: "/reports/property-q3.pdf" },
  { id: 2, title: "User Report Q3", link: "/reports/user-q3.pdf" },
];
