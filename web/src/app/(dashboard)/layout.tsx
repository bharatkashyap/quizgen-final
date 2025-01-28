import * as React from "react";

import { MainNav } from "../../components/main-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}
