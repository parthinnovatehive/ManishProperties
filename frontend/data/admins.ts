export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super-admin';
  status: 'active' | 'inactive';
  permissions: string[];
  joinedDate: string;
}

export const admins: AdminUser[] = [
  {
    id: "adm1",
    name: "EstateElite Admin",
    email: "admin@estateelite.com",
    role: "admin",
    status: "active",
    permissions: ["Manage Users", "Manage Agents", "Approve Properties", "View Appointments", "Resolve Complaints"],
    joinedDate: "01 Dec 2025"
  },
  {
    id: "adm2",
    name: "Nisha Sen",
    email: "nisha@estateelite.com",
    role: "admin",
    status: "active",
    permissions: ["Manage Users", "Approve Properties", "Resolve Complaints"],
    joinedDate: "15 Jan 2026"
  },
  {
    id: "sa1",
    name: "Super Admin",
    email: "superadmin@estateelite.com",
    role: "super-admin",
    status: "active",
    permissions: ["All System Permissions", "Admin Management", "Analytics Access", "Security Settings"],
    joinedDate: "01 Jan 2025"
  }
];
