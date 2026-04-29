import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Dashboard",
  openGraph: {
    title: "very-princess – Organization Dashboard",
    description: "View organization details and claim contributor payouts on-chain.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "very-princess – Organization Dashboard",
    description: "View organization details and claim contributor payouts on-chain.",
  },
};

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}