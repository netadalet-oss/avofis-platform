import { redirect } from "next/navigation";

// Legacy placeholder: use the access-controlled staff CMS rather than a public fake module.
export default function Page() {
  redirect("/cms");
}
