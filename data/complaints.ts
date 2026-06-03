export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  resolutionNotes?: string;
}

export const complaints: Complaint[] = [
  {
    id: "comp1",
    userId: "u1",
    userName: "John Doe",
    userEmail: "user@estateelite.com",
    subject: "Incorrect location on Worli property page",
    description: "The pin on the map shows Worli West, but the actual building is located in Worli Sea Face area. Please rectify this to avoid confusion.",
    status: "In Progress",
    priority: "Medium",
    date: "01 Jun 2026",
  },
  {
    id: "comp2",
    userId: "u1",
    userName: "John Doe",
    userEmail: "user@estateelite.com",
    subject: "Agent did not show up for appointment",
    description: "I scheduled a visit for the Pune apartment on 29th May, but no one was present at the location and the agent's phone was unreachable.",
    status: "Open",
    priority: "High",
    date: "02 Jun 2026",
  },
  {
    id: "comp3",
    userId: "u2",
    userName: "Alice Cooper",
    userEmail: "alice@example.com",
    subject: "Unable to upload photos for property listing",
    description: "Whenever I try to add images in the submit-property form, the website throws a mock upload error. I tried with JPG and PNG.",
    status: "Resolved",
    priority: "Low",
    date: "25 May 2026",
    resolutionNotes: "Resolved by updating upload UI limit settings to allow files up to 10MB.",
  },
  {
    id: "comp4",
    userId: "u3",
    userName: "Bob Dylan",
    userEmail: "bob@example.com",
    subject: "Spam calls from brokers",
    description: "Since registering, I am getting calls from independent brokers who claim to have got my number from EstateElite. Please check for data leaks.",
    status: "Open",
    priority: "High",
    date: "03 Jun 2026"
  }
];
