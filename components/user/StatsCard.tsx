interface StatsCardProps {
  title: string;
  value: number;
}

export default function StatsCard({
  title,
  value,
}: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <p className="text-3xl font-bold text-green-600 mt-2">
        {value}
      </p>
    </div>
  );
}