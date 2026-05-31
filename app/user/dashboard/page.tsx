import StatsCard from "@/components/user/StatsCard";

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

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
    </div>
  );
}