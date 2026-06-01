import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GrainOverlay from "@/components/shared/GrainOverlay";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
