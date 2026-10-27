import { redirect } from "next/navigation";
// Legacy research modules are not part of the public AVOfis service catalogue.
// The historical source remains in Git, but visitors are directed to verified public information.
export default function ModulesPage() {
  redirect("/bilgi");
}
