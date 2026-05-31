export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Profile
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-xl">
        <div className="h-24 w-24 rounded-full bg-[#164a34] text-white flex items-center justify-center text-3xl font-bold mb-6">
          D
        </div>

        <h2 className="text-xl font-semibold">
          Deepak
        </h2>

        <p className="text-gray-500 mt-2">
          deepak@gmail.com
        </p>

        <p className="text-gray-500">
          +91 9876543210
        </p>

        <button className="mt-6 bg-[#164a34] text-white px-5 py-3 rounded-lg">
          Edit Profile
        </button>
      </div>
    </div>
  );
}