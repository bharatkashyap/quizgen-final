"use client";
import { useSubmissions } from "../hooks";

interface SubmissionsTableProps {
  leagueSlug: string;
  questionNumber?: string;
}

export default function SubmissionsTable({
  leagueSlug,
  questionNumber,
}: SubmissionsTableProps) {
  const { data: submissions, isLoading } = useSubmissions(
    leagueSlug,
    questionNumber
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8 text-gray-500 dark:text-gray-400">
        Loading submissions...
      </div>
    );
  }

  if (!submissions?.length) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8 text-gray-500 dark:text-gray-400">
        No submissions yet
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto rounded-md border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Submitted At</th>
              <th className="px-4 py-2 text-left">Answer</th>
              <th className="px-4 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                <td className="px-4 py-2">{submission.user.name}</td>
                <td className="px-4 py-2">
                  {/* {new Date(submission.submittedAt).toLocaleDateString()} */}
                </td>
                {/* <td className="px-4 py-2">{submission.answer}</td> */}
                <td className="px-4 py-2">{submission.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
