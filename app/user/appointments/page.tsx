import AppointmentCard from "@/components/user/AppointmentCard";

export default function AppointmentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Appointments
      </h1>

      <div className="space-y-4">
        <AppointmentCard
          property="Luxury Villa"
          date="12 Aug 2026"
          agent="Rahul Sharma"
          status="Confirmed"
        />

        <AppointmentCard
          property="Premium Apartment"
          date="15 Aug 2026"
          agent="Priya Patil"
          status="Scheduled"
        />

        <AppointmentCard
          property="Commercial Office"
          date="18 Aug 2026"
          agent="Amit Verma"
          status="Pending"
        />
      </div>
    </div>
  );
}