import {
  HeroSlider,
  TopCampaigns,
  HowItWorks,
  Categories,
  Testimonials,
  ImpactStats,
  HomeCta,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <TopCampaigns />
      <HowItWorks />
      <Categories />
      <ImpactStats />
      <Testimonials />
      <HomeCta />
    </>
  );
}
