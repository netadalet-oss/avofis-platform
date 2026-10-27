import { redirect } from "next/navigation";
// Keep old bookmarks functioning without advertising unfinished analysis or forum modules.
export default function DashboardPage() {
  redirect("/musteri");
}
