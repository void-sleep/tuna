import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfileAction } from "@/app/actions/friends";
import { SettingsPageClient } from "@/components/settings-page-client";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentUserProfileAction();

  return <SettingsPageClient profile={profile} />;
}
