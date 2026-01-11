import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFriendsAction, getReceivedFriendRequestsAction, getSentFriendRequestsAction } from "@/app/actions/friends";
import { FriendsPageRedesigned } from "@/components/friends-page-redesigned";

export default async function FriendsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const [friends, receivedRequests, sentRequests] = await Promise.all([
    getFriendsAction(),
    getReceivedFriendRequestsAction(),
    getSentFriendRequestsAction(),
  ]);

  return (
    <FriendsPageRedesigned
      friends={friends}
      receivedRequests={receivedRequests}
      sentRequests={sentRequests}
    />
  );
}
