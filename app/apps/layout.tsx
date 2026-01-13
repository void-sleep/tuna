import { Navbar } from "@/components/navbar";
import { FloatingBubble } from "@/components/floating-bubble";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <FloatingBubble />
    </div>
  );
}
