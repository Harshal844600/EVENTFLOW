import { redirect } from "next/navigation";

export default function DashboardPage() {
  // The primary view for a normal user's dashboard is their bookings
  redirect("/dashboard/bookings");
}
