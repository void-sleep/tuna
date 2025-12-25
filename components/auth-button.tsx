import Link from "next/link";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";
import { useTranslations } from "next-intl";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const t = useTranslations('auth.button');
  const [user, setUser] = useState<{ email?: string; avatar_url?: string; full_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-9 w-16" />;
  }

  return user ? (
    <div className="flex items-center gap-1.5">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-9 w-9 rounded-xl hover:bg-violet-500/10 transition-all duration-200 p-0"
      >
        <Link href="/apps">
          <Squares2X2Icon className="h-5 w-5 text-muted-foreground" />
        </Link>
      </Button>
      <UserMenu userEmail={user.email} avatarUrl={user.avatar_url} fullName={user.full_name} />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-all duration-200"
      >
        <Link href="/auth/login">{t('login')}</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="h-9 px-4 text-sm font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200 hover:scale-105"
      >
        <Link href="/auth/sign-up">{t('signup')}</Link>
      </Button>
    </div>
  );
}
