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
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold">
        {property}
      </h3>

      <p className="text-sm text-gray-500">
        Date: {date}
      </p>

      <p className="text-sm text-gray-500">
        Agent: {agent}
      </p>

      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
        {status}
      </span>
    </div>
  );
}