"use client";
import * as React from "react";
import { updateLeague, deleteLeague } from "../../../../actions/league";
import LeagueForm from "../../../../../components/league-form";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@base-ui-components/react/alert-dialog";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete League"}
    </button>
  );
}

export default function LeagueSettingsPage({
  params,
}: {
  params: { leagueSlug: string };
}) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    const slug = (await params).leagueSlug;
    const response = await updateLeague(slug, formData);
    if (!response.slug && response.message) {
      toast.error(response.message);
    } else if (response.slug && response.message) {
      toast.success(response.message);
    }
    return response;
  }

  async function handleDelete(formData: FormData) {
    const slug = (await params).leagueSlug;
    await deleteLeague(slug);
    router.push("/leagues");
    router.refresh();
  }

  return (
    <div className="container max-w-2xl py-8">
      <LeagueForm onSubmit={handleSubmit} submitText="Save Changes" />

      <div className="mt-16">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="border-2 border-red-200 dark:border-red-900/50 rounded-lg p-6">
          <h3 className="font-medium mb-2">Delete League</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Once you delete a league, there is no going back. Please be certain.
          </p>
          <AlertDialog.Root
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialog.Trigger
              render={() => (
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Delete League
                </button>
              )}
            />
            <AlertDialog.Portal>
              <AlertDialog.Backdrop className="fixed inset-0 bg-black/50" />
              <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6">
                <AlertDialog.Title className="text-lg font-semibold mb-4">
                  Are you sure?
                </AlertDialog.Title>
                <AlertDialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone. This will permanently delete
                  your league and all its questions.
                </AlertDialog.Description>
                <form action={handleDelete} className="flex gap-4 justify-end">
                  <AlertDialog.Close
                    render={() => (
                      <button
                        type="button"
                        onClick={() => setShowDeleteDialog(false)}
                        className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 
                      bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        Cancel
                      </button>
                    )}
                  />
                  <DeleteButton />
                </form>
              </AlertDialog.Popup>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      </div>
    </div>
  );
}
