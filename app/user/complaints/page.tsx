export default function ComplaintsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Complaints
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold mb-4">
          Raise Complaint
        </h2>

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Subject"
        />

        <textarea
          className="w-full border rounded-lg p-3 mb-4"
          rows={5}
          placeholder="Describe your issue..."
        />

        <button className="bg-[#164a34] text-white px-6 py-3 rounded-lg">
          Submit Complaint
        </button>
      </div>
    </div>
  );
}