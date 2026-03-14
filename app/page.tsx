import { getRoleHome, requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { profile } = await requireSession();
  redirect(getRoleHome(profile.role));
}
