import { getFriendTimelineAction } from '@/app/actions/agree-questions';
import { FriendTimelineClient } from './friend-timeline-client';
import { redirect } from 'next/navigation';

interface FriendTimelinePageProps {
  params: Promise<{ friendId: string }>;
}

export default async function FriendTimelinePage({ params }: FriendTimelinePageProps) {
  const { friendId } = await params;

  const { questions, friend, totalCount } = await getFriendTimelineAction(friendId);

  if (!friend) {
    redirect('/apps/friends');
  }

  return (
    <FriendTimelineClient
      friend={friend}
      questions={questions}
      totalCount={totalCount}
    />
  );
}
