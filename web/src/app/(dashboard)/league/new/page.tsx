"use client";

import { useRouter } from "next/navigation";
import { createLeague } from "../../../actions/league";
import LeagueForm from "../../../../components/league-form";
import { toast } from "sonner";
import * as React from "react";

export default function NewLeaguePage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const response = await createLeague(formData);
    if (!response.slug && response.message) {
      toast.error(response.message);
      return response;
    }
    router.push(`/league/${response.slug}/questions`);
    return response;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Create New League</h1>
      <LeagueForm
        onSubmit={handleSubmit}
        submitText="Create League"
        showCancelButton={false}
      />
    </div>
  );
}
