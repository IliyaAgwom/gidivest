import Hero from "@/components/Hero";
import Investments from "@/components/Investments";
import TrustIndicators from "@/components/TrustIndicators";
import SmartFeatures from "@/components/SmartFeatures";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import RecentWithdrawals from "@/components/RecentWithdrawals";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <Investments />
      <SmartFeatures />
      <Testimonials />
      <Pricing />
      {/* FOMO Popup Component */}
      <RecentWithdrawals />
    </>
  );
}
