import { useQuery, type QueryObserverOptions } from "@tanstack/react-query";
import {
  League,
  LeaguesResponse,
  QuestionsResponse,
  Question,
  Submission,
  Answer,
} from "../types";

export function useFetch<T>(
  path: string,
  queryKey: string[],
  options?: Omit<QueryObserverOptions<T>, "queryKey">
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(path);
      if (!response.ok)
        throw new Error(`Failed to fetch ${queryKey.join("/")}`);
      const data = await response.json();
      return options?.select ? options.select(data) : data;
    },
    retry: false,
    ...options, // Spread any additional options
  });
}

export function useLeagues(
  options?: Omit<QueryObserverOptions<LeaguesResponse>, "queryKey">
) {
  return useFetch<LeaguesResponse>("/api/leagues", ["league/all"], options);
}

export function usePublicLeagues(
  options?: QueryObserverOptions<LeaguesResponse>
) {
  return useFetch<LeaguesResponse>(
    "/api/leagues/all",
    ["leagues/public/"],
    options
  );
}

export function useLeague(
  slug: string,
  options?: QueryObserverOptions<League>
) {
  return useFetch<League>(`/api/league/${slug}`, [`league/${slug}`], options);
}

export function useQuestions(
  leagueSlug: string,
  options?: QueryObserverOptions<QuestionsResponse>
) {
  return useFetch<QuestionsResponse>(
    `/api/league/${leagueSlug}/questions`,
    [`questions/league-${leagueSlug}`],
    options
  );
}

export function useSubmissions(
  leagueSlug: string,
  questionNumber?: string,
  options?: QueryObserverOptions<Submission[]>
) {
  return useFetch<Submission[]>(
    `/api/league/${leagueSlug}/question/${questionNumber}/submissions`,
    [`submissions/${leagueSlug}/${questionNumber}`],
    options
  );
}

export function useQuestion(
  leagueSlug: string,
  number?: string,
  options?: Omit<QueryObserverOptions<Question>, "queryKey">
) {
  return number
    ? useFetch<Question>(
        `/api/league/${leagueSlug}/questions/${number}`,
        [`questions/${leagueSlug}/${number}`],
        options
      )
    : { data: undefined, isLoading: false };
}

export function useAnswer(
  leagueSlug: string,
  questionNumber?: string,
  options?: QueryObserverOptions<Answer>
) {
  return questionNumber
    ? useFetch<Answer>(
        `/api/league/${leagueSlug}/questions/${questionNumber}/answer`,
        [`answer/${leagueSlug}/${questionNumber}`],
        options
      )
    : { data: undefined, isLoading: false };
}
