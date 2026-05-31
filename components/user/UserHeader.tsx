export default function UserHeader() {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">
          Welcome Back 👋
        </h2>
        <p className="text-sm text-gray-500">
          Manage your properties and appointments
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
          D
        </div>

        <div>
          <p className="font-medium">
            Deepak
          </p>
          <p className="text-xs text-gray-500">
            User Account
          </p>
        </div>
      </div>
    </header>
  );
}