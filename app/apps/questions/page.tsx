import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyQuestionsAction } from "@/app/actions/agree-questions";
import { getFriendsAction } from "@/app/actions/friends";
import { QuestionsPageClient } from "@/components/questions-page-client";

export default async function QuestionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const [{ sent, received }, friends] = await Promise.all([
    getMyQuestionsAction(),
    getFriendsAction(),
  ]);

  return (
    <QuestionsPageClient
      sentQuestions={sent}
      receivedQuestions={received}
      friends={friends}
    />
  );
}
