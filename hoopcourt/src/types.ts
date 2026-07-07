export interface TeamSummary {
  id: string;
  name: string;
  sport?: string;
  league?: string;
  country?: string;
  venue?: string;
  badge?: string;
  description?: string;
}

export interface Player {
  id: string;
  name: string;
  teamId?: string;
  position?: string;
  nationality?: string;
  height?: string;
  weight?: string;
  number?: string;
  status?: string;
  birthDate?: string;
  thumb?: string;
  cutout?: string;
}

export interface EventResult {
  id: string;
  date: string;
  league: string;
  home: string;
  away: string;
  homeScore: string | null;
  awayScore: string | null;
  homeId: string;
  awayId: string;
  venue?: string;
}

export interface SeasonAverage {
  playerId: number;
  playerName: string;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  fgPct: number | null;
  gamesPlayed: number | null;
}

export type CourtSlotId = "PG" | "SG" | "SF" | "PF" | "C";

export interface CourtSlot {
  id: CourtSlotId;
  label: string;
  top: string;
  left: string;
}
