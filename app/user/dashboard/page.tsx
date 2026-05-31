import StatsCard from "@/components/user/StatsCard";
import AppointmentCard from "@/components/user/AppointmentCard";
import SavedPropertyCard from "@/components/user/SavedPropertyCard";

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Saved Properties"
          value={12}
        />

        <StatsCard
          title="Appointments"
          value={5}
        />

        <StatsCard
          title="Complaints"
          value={2}
        />

        <StatsCard
          title="Properties Viewed"
          value={48}
        />
      </div>

      {/* Upcoming Appointments */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Upcoming Appointments
      </h2>

      <div className="grid gap-4">
        <AppointmentCard
          property="Luxury Villa, Mumbai"
          date="12 Aug 2026"
          agent="Rahul Sharma"
          status="Confirmed"
        />

        <AppointmentCard
          property="2 BHK Apartment, Pune"
          date="15 Aug 2026"
          agent="Priya Patil"
          status="Scheduled"
        />
      </div>

      {/* Saved Properties */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Saved Properties
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SavedPropertyCard
          title="Luxury Villa"
          location="Mumbai"
          price="₹1.2 Cr"
        />

        <SavedPropertyCard
          title="Premium Apartment"
          location="Pune"
          price="₹85 Lakh"
        />

        <SavedPropertyCard
          title="Sea View Penthouse"
          location="Navi Mumbai"
          price="₹2.5 Cr"
        />
      </div>
    </div>
  );
}