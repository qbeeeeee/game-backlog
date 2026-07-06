import type { DashboardCategory } from "@/lib/dashboard-categories";
import type { DashboardGameDetail, GamesFilters } from "@/lib/category-api-core";
import { fetchDashboardGameDetail, fetchGames } from "@/lib/categories/games-api";
import {
  fetchDashboardMovieDetail,
  fetchMovies,
} from "@/lib/categories/movies-api";

export * from "@/lib/category-api-core";
export { fetchGames, fetchDashboardGameDetail } from "@/lib/categories/games-api";
export {
  fetchMovies,
  fetchDashboardMovieDetail,
} from "@/lib/categories/movies-api";

export async function fetchCategoryItems(
  category: DashboardCategory,
  filters: GamesFilters,
) {
  if (category === "games") {
    return fetchGames(filters);
  }

  if (category === "movies") {
    return fetchMovies(filters);
  }

  return [];
}

export async function fetchDashboardCategoryDetail(
  category: DashboardCategory,
  id: string,
  externalId?: string | null,
): Promise<DashboardGameDetail> {
  if (category === "games") {
    return fetchDashboardGameDetail(id, externalId);
  }

  if (category === "movies") {
    return fetchDashboardMovieDetail(externalId ?? id);
  }

  throw new Error(`Category ${category} does not support details yet.`);
}
