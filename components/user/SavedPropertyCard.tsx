interface SavedPropertyCardProps {
  title: string;
  location: string;
  price: string;
}

export default function SavedPropertyCard({
  title,
  location,
  price,
}: SavedPropertyCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        📍 {location}
      </p>

      <p className="mt-4 text-xl font-bold text-[#164a34]">
        {price}
      </p>
    </div>
  );
}