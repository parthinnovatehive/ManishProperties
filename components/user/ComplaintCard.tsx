interface ComplaintCardProps {
  subject: string;
  status: string;
}

export default function ComplaintCard({
  subject,
  status,
}: ComplaintCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold">
        {subject}
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        Status: {status}
      </p>
    </div>
  );
}