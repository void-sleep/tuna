import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyQuestionsAction } from "@/app/actions/agree-questions";
import { getFriendsAction } from "@/app/actions/friends";
import { QuestionsPageClient } from "@/components/questions-page-client";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const applicationId = params.app;

  // Get application title if filtering by app
  let applicationTitle: string | undefined;
  if (applicationId) {
    const { data: application } = await supabase
      .from('applications')
      .select('title')
      .eq('id', applicationId)
      .single();

    if (application) {
      applicationTitle = application.title;
    }
  }

  const [{ sent, received }, friends] = await Promise.all([
    getMyQuestionsAction(applicationId),
    getFriendsAction(),
  ]);

  return (
    <QuestionsPageClient
      sentQuestions={sent}
      receivedQuestions={received}
      friends={friends}
      applicationTitle={applicationTitle}
    />
  );
}
