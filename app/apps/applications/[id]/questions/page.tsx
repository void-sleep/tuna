import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyQuestionsAction } from "@/app/actions/agree-questions";
import { QuestionsList } from "@/components/questions-list";

export default async function ApplicationQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch application to verify access
  const { data: application } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!application) {
    redirect("/apps");
  }

  const questions = await getMyQuestionsAction();

  return (
    <QuestionsList
      applicationTitle={application.title}
      questions={questions}
    />
  );
}
