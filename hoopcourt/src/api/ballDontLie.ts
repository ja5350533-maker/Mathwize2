import type { SeasonAverage } from "../types";

// Deeper NBA per-season stats (PTS/REB/AST/...). balldontlie.io requires a
// free API key (sign up at balldontlie.io) — the key never ships with this
// app, the user pastes their own and it's kept in localStorage only.
const BASE = "https://api.balldontlie.io/v1";

export class BallDontLieError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function bdl<T>(apiKey: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/${path}${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) {
    const detail =
      res.status === 401
        ? "Clave inválida."
        : res.status === 403 || res.status === 429
          ? "Tu plan gratuito no incluye este dato o alcanzaste el límite de peticiones."
          : `Error ${res.status}.`;
    throw new BallDontLieError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

interface BdlPlayer {
  id: number;
  first_name: string;
  last_name: string;
  team?: { full_name: string };
}

export async function searchNbaPlayers(apiKey: string, search: string): Promise<BdlPlayer[]> {
  const data = await bdl<{ data: BdlPlayer[] }>(apiKey, "players", { search, per_page: "10" });
  return data.data;
}

interface BdlSeasonAverage {
  player_id: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg_pct: number;
  games_played: number;
}

export async function getSeasonAverages(
  apiKey: string,
  season: number,
  players: BdlPlayer[]
): Promise<SeasonAverage[]> {
  if (players.length === 0) return [];
  const params: Record<string, string> = { season: String(season), season_type: "regular", type: "base" };
  const qs = new URLSearchParams(params);
  players.forEach((p) => qs.append("player_ids[]", String(p.id)));
  const res = await fetch(`${BASE}/season_averages/general?${qs.toString()}`, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) {
    throw new BallDontLieError(
      res.status === 403 ? "Los promedios de temporada requieren un plan de pago en balldontlie.io." : `Error ${res.status}.`,
      res.status
    );
  }
  const json = (await res.json()) as { data: BdlSeasonAverage[] };
  return json.data.map((row) => {
    const player = players.find((p) => p.id === row.player_id);
    return {
      playerId: row.player_id,
      playerName: player ? `${player.first_name} ${player.last_name}` : `#${row.player_id}`,
      pts: row.pts ?? null,
      reb: row.reb ?? null,
      ast: row.ast ?? null,
      stl: row.stl ?? null,
      blk: row.blk ?? null,
      fgPct: row.fg_pct ?? null,
      gamesPlayed: row.games_played ?? null,
    };
  });
}
