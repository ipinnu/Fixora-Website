import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import HowItWorks from "@/components/home/HowItWorks";
import ArtisanShowcase from "@/components/home/ArtisanShowcase";
import ServiceSearch from "@/components/home/ServiceSearch";
import CtaBanner from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <ArtisanShowcase />
      <ServiceSearch />
      <CtaBanner />
    </>
  );
}
