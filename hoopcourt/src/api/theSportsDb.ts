import type { EventResult, Player, TeamSummary } from "../types";

// Free public tier of TheSportsDB (test key "3"). No signup required.
// Only point-lookup/search endpoints are available on this tier —
// "list all" / "browse by league" endpoints require a paid key, so every
// screen in this app is reachable through a name search instead.
const BASE = "https://www.thesportsdb.com/api/v1/json/3";

async function tsdb<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/${path}?${qs}`);
  if (!res.ok) {
    throw new Error(`TheSportsDB respondió ${res.status} en ${path}`);
  }
  return res.json() as Promise<T>;
}

interface RawTeam {
  idTeam: string;
  strTeam: string;
  strSport: string;
  strLeague?: string;
  strCountry?: string;
  strStadium?: string;
  strTeamBadge?: string;
  strDescriptionEN?: string;
}

function mapTeam(t: RawTeam): TeamSummary {
  return {
    id: t.idTeam,
    name: t.strTeam,
    sport: t.strSport,
    league: t.strLeague,
    country: t.strCountry,
    venue: t.strStadium,
    badge: t.strTeamBadge,
    description: t.strDescriptionEN,
  };
}

export async function searchTeams(name: string): Promise<TeamSummary[]> {
  const data = await tsdb<{ teams: RawTeam[] | null }>("searchteams.php", { t: name });
  return (data.teams ?? [])
    .filter((t) => t.strSport === "Basketball")
    .map(mapTeam);
}

interface RawPlayer {
  idPlayer: string;
  idTeam?: string;
  strPlayer: string;
  strPosition?: string;
  strNationality?: string;
  strHeight?: string;
  strWeight?: string;
  strNumber?: string;
  strStatus?: string;
  dateBorn?: string;
  strThumb?: string;
  strCutout?: string;
}

function mapPlayer(p: RawPlayer): Player {
  return {
    id: p.idPlayer,
    teamId: p.idTeam,
    name: p.strPlayer,
    position: p.strPosition,
    nationality: p.strNationality,
    height: p.strHeight,
    weight: p.strWeight,
    number: p.strNumber,
    status: p.strStatus,
    birthDate: p.dateBorn,
    thumb: p.strThumb,
    cutout: p.strCutout,
  };
}

const NON_PLAYER_ROLES = new Set(["Manager", "Coach", "Head Coach", "Assistant Coach"]);

export async function getTeamRoster(teamId: string): Promise<Player[]> {
  const data = await tsdb<{ player: RawPlayer[] | null }>("lookup_all_players.php", { id: teamId });
  return (data.player ?? [])
    .filter((p) => !NON_PLAYER_ROLES.has(p.strPosition ?? ""))
    .map(mapPlayer);
}

export async function searchPlayers(name: string): Promise<Player[]> {
  const data = await tsdb<{ player: RawPlayer[] | null }>("searchplayers.php", { p: name });
  return (data.player ?? [])
    .filter((p) => !p.strPosition || true) // TheSportsDB doesn't expose sport on this endpoint reliably
    .map(mapPlayer);
}

interface RawEvent {
  idEvent: string;
  dateEvent: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strVenue?: string;
}

function mapEvent(e: RawEvent): EventResult {
  return {
    id: e.idEvent,
    date: e.dateEvent,
    league: e.strLeague,
    home: e.strHomeTeam,
    away: e.strAwayTeam,
    homeId: e.idHomeTeam,
    awayId: e.idAwayTeam,
    homeScore: e.intHomeScore,
    awayScore: e.intAwayScore,
    venue: e.strVenue,
  };
}

export async function getTeamRecentResults(teamId: string): Promise<EventResult[]> {
  const data = await tsdb<{ results: RawEvent[] | null }>("eventslast.php", { id: teamId });
  return (data.results ?? []).map(mapEvent);
}
