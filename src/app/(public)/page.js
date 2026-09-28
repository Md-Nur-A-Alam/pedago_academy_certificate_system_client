import { HeroBanner } from "@/features/home/HeroBanner";
import { ParticipantRegistrationSection } from "@/features/participants";
import { TacticalPortal } from "@/features/home/TacticalPortal";
import { ViewCompetitions } from "@/features/home/ViewCompetitions";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <ParticipantRegistrationSection />
      <TacticalPortal />
      <ViewCompetitions />
    </>
  );
}
