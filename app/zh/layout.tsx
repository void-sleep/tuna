import { NextIntlClientProvider } from "next-intl";

// Import Chinese messages directly
import zhMessages from "@/messages/zh-CN.json";

export default function ZhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale="zh-CN" messages={zhMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
