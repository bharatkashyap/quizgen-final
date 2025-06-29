import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitAnswer, getUserSubmission } from "../app/actions/submission";
import { toast } from "sonner";

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await submitAnswer(formData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      const questionId = variables.get("questionId") as string;
      const leagueSlug = variables.get("leagueSlug") as string;
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["submission", questionId],
      });
      queryClient.invalidateQueries({
        queryKey: [`submissions/league-${leagueSlug}`],
      });
      
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUserSubmission(questionId: string) {
  return useQuery({
    queryKey: ["submission", questionId],
    queryFn: () => getUserSubmission(questionId),
    enabled: !!questionId,
  });
}