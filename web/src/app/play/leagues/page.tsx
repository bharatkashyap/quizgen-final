import * as React from "react";
import { LeagueList } from "../../../components/leagues-list";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LeagueList />
    </div>
  );
}
