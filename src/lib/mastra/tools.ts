import { createTool } from "@mastra/core";
import { z } from "zod";

// TMDB API configuration
const TMDB_ACCESS_TOKEN =
  process.env.TMDB_ACCESS_TOKEN ||
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYTZlMmU5MGFlYjRiZmIyNWIwNjEwMWZlNTZlYzVmZSIsIm5iZiI6MTc1MTU0MDkwNy4zMjgsInN1YiI6IjY4NjY2NGFiYjA2NGEzY2MxZTljMmYyOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.br3WRLG0Gmyuh6qwvWYWS7KRJt-S_OwjjnUHtTJmH_A";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Helper function to create TMDB headers
const getTMDBHeaders = () => ({
  Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  accept: "application/json",
});

// TMDB Types
interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  poster_path?: string;
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
  total_results: number;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

// Cache for genres to avoid repeated API calls
let genresCache: TMDBGenre[] = [];

// Helper function to load genres
async function loadGenres(): Promise<TMDBGenre[]> {
  if (genresCache.length > 0) {
    return genresCache;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?language=en-US`,
      { headers: getTMDBHeaders() }
    );

    if (!response.ok) {
      console.error("TMDB API Error:", response.status, response.statusText);
      return [];
    }

    const data: TMDBGenresResponse = await response.json();
    genresCache = data.genres;
    return genresCache;
  } catch (error) {
    console.error("Failed to load genres:", error);
    return [];
  }
}

// Tool 1: Search Movies
export const searchMoviesTool = createTool({
  id: "search-movies",
  description:
    "Search for movies by title, actor, director, or any search term",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Search query (movie title, actor name, director, etc.)"),
    year: z.number().optional().describe("Optional year filter"),
    genre: z.string().optional().describe("Optional genre filter"),
    minRating: z.number().optional().describe("Minimum rating filter (0-10)"),
  }),
  outputSchema: z.object({
    movies: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        overview: z.string(),
        release_date: z.string(),
        vote_average: z.number(),
        genres: z.array(z.string()),
      })
    ),
    total_results: z.number(),
  }),
  execute: async ({ context }) => {
    const { query, year, genre, minRating } = context;

    try {
      let url = `${TMDB_BASE_URL}/search/movie?language=en-US&page=1&include_adult=false`;
      url += `&query=${encodeURIComponent(query)}`;

      if (year) {
        url += `&year=${year}`;
      }

      const response = await fetch(url, { headers: getTMDBHeaders() });

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      const genres = await loadGenres();
      const genreMap = genres.reduce((acc, g) => {
        acc[g.id] = g.name;
        return acc;
      }, {} as Record<number, string>);

      let movies = data.results?.slice(0, 6) || [];

      // Apply filters
      if (genre) {
        const genreId = genres.find(
          (g) =>
            g.name.toLowerCase().includes(genre.toLowerCase()) ||
            genre.toLowerCase().includes(g.name.toLowerCase())
        )?.id;
        if (genreId) {
          movies = movies.filter((m) => m.genre_ids.includes(genreId));
        }
      }

      if (minRating !== undefined) {
        movies = movies.filter((m) => m.vote_average >= minRating);
      }

      const formattedMovies = movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "No description available.",
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genre_ids.map((id) => genreMap[id]).filter(Boolean),
      }));

      return {
        movies: formattedMovies,
        total_results: data.total_results,
      };
    } catch (error) {
      console.error("Search movies error:", error);
      return {
        movies: [],
        total_results: 0,
      };
    }
  },
});

// Tool 2: Discover Movies
export const discoverMoviesTool = createTool({
  id: "discover-movies",
  description: "Discover movies by genre, year, rating, and other criteria",
  inputSchema: z.object({
    genre: z.string().optional().describe("Genre to filter by"),
    year: z.number().optional().describe("Year to filter by"),
    minRating: z.number().optional().describe("Minimum rating (0-10)"),
    sortBy: z
      .enum(["popularity.desc", "vote_average.desc", "release_date.desc"])
      .optional()
      .describe("Sort criteria"),
  }),
  outputSchema: z.object({
    movies: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        overview: z.string(),
        release_date: z.string(),
        vote_average: z.number(),
        genres: z.array(z.string()),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { genre, year, minRating, sortBy = "popularity.desc" } = context;

    try {
      let url = `${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=${sortBy}`;

      if (genre) {
        const genres = await loadGenres();
        const genreId = genres.find(
          (g) =>
            g.name.toLowerCase().includes(genre.toLowerCase()) ||
            genre.toLowerCase().includes(g.name.toLowerCase())
        )?.id;
        if (genreId) {
          url += `&with_genres=${genreId}`;
        }
      }

      if (year) {
        url += `&year=${year}`;
      }

      if (minRating) {
        url += `&vote_average.gte=${minRating}`;
      }

      // Add vote count filter for quality results
      url += "&vote_count.gte=100";

      const response = await fetch(url, { headers: getTMDBHeaders() });

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      const genres = await loadGenres();
      const genreMap = genres.reduce((acc, g) => {
        acc[g.id] = g.name;
        return acc;
      }, {} as Record<number, string>);

      const movies = data.results?.slice(0, 6) || [];
      const formattedMovies = movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "No description available.",
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genre_ids.map((id) => genreMap[id]).filter(Boolean),
      }));

      return { movies: formattedMovies };
    } catch (error) {
      console.error("Discover movies error:", error);
      return { movies: [] };
    }
  },
});

// Tool 3: Get Trending Movies
export const trendingMoviesTool = createTool({
  id: "trending-movies",
  description: "Get currently trending movies",
  inputSchema: z.object({
    timeWindow: z
      .enum(["day", "week"])
      .optional()
      .describe("Time window for trending (default: week)"),
  }),
  outputSchema: z.object({
    movies: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        overview: z.string(),
        release_date: z.string(),
        vote_average: z.number(),
        genres: z.array(z.string()),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { timeWindow = "week" } = context;

    try {
      const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?language=en-US`;
      const response = await fetch(url, { headers: getTMDBHeaders() });

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      const genres = await loadGenres();
      const genreMap = genres.reduce((acc, g) => {
        acc[g.id] = g.name;
        return acc;
      }, {} as Record<number, string>);

      const movies = data.results?.slice(0, 6) || [];
      const formattedMovies = movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "No description available.",
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genre_ids.map((id) => genreMap[id]).filter(Boolean),
      }));

      return { movies: formattedMovies };
    } catch (error) {
      console.error("Trending movies error:", error);
      return { movies: [] };
    }
  },
});

// Tool 4: Get Movie Genres
export const movieGenresTool = createTool({
  id: "movie-genres",
  description: "Get all available movie genres",
  inputSchema: z.object({}),
  outputSchema: z.object({
    genres: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
  }),
  execute: async () => {
    try {
      const genres = await loadGenres();
      return { genres };
    } catch (error) {
      console.error("Get genres error:", error);
      return { genres: [] };
    }
  },
});
