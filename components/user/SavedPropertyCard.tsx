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
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-gray-500 text-sm">
        {location}
      </p>

      <p className="text-green-600 font-bold mt-2">
        {price}
      </p>
    </div>
  );
}