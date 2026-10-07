import { redirect } from "next/navigation";

/** Old link — registration now starts directly at /register (TSMU ID only). */
export default function TsmuIdRegisterRedirect() {
  redirect("/register");
}
