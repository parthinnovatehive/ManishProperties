interface AppointmentCardProps {
  property: string;
  date: string;
  agent: string;
  status: string;
}

export default function AppointmentCard({
  property,
  date,
  agent,
  status,
}: AppointmentCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
      <h3 className="text-lg font-semibold text-gray-800">
        {property}
      </h3>

      <div className="mt-3 space-y-1">
        <p className="text-sm text-gray-500">
          📅 {date}
        </p>

        <p className="text-sm text-gray-500">
          👤 {agent}
        </p>
      </div>

      <span className="inline-block mt-4 px-3 py-1 rounded-full bg-green-100 text-[#164a34] text-sm font-medium">
        {status}
      </span>
    </div>
  );
}