import UserSidebar from "@/components/user/UserSidebar";
import UserHeader from "@/components/user/UserHeader";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />

      <div className="flex-1">
        <UserHeader />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}