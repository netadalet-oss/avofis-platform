import {redirect} from "next/navigation";
/** The former admin login is replaced by the verified staff login + MFA flow. */
export default function StaffLoginAlias(){redirect("/login");}
