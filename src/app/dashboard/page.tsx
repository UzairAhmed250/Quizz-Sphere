import { redirect } from "next/navigation";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import { getCurrentUserWithProfile } from "@/lib/auth/session";

export default async function DashboardIndexPage() {
  const session = await getCurrentUserWithProfile();

  if (!session) {
    redirect("/login");
  }

  redirect(getDashboardPathForRole(session.profile.role));
}
