import { redirect } from "next/navigation";

export default function SuperAdminLoginPage() {
  redirect("/auth/login");
}
