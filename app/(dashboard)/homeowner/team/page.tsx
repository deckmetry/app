import { TeamManagement } from "@/components/team/team-management";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Deckmetry",
};

export default function HomeownerTeamPage() {
  return <TeamManagement />;
}
