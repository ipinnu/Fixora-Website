import type { Metadata } from "next";
import GrainOverlay from "@/components/shared/GrainOverlay";

export const metadata: Metadata = {
  title: "FIXORA — Account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <GrainOverlay />
      {children}
    </div>
  );
}
