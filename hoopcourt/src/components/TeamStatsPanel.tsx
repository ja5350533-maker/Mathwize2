import { useEffect, useState } from "react";
import { getTeamRecentResults } from "../api/theSportsDb";
import type { EventResult, Player, TeamSummary } from "../types";
import PlayerCard from "./PlayerCard";
import NbaStatsPanel from "./NbaStatsPanel";

interface Props {
  team: TeamSummary;
  roster: Player[];
  rosterLoading: boolean;
  rosterError: string;
}

export default function TeamStatsPanel({ team, roster, rosterLoading, rosterError }: Props) {
  const [results, setResults] = useState<EventResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setResultsLoading(true);
    setResultsError("");
    getTeamRecentResults(team.id)
      .then((r) => !cancelled && setResults(r))
      .catch(() => !cancelled && setResultsError("No se pudieron cargar los últimos resultados."))
      .finally(() => !cancelled && setResultsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [team.id]);

  const isNba = team.league === "NBA";

  return (
    <>
      <div className="panel">
        <div className="team-header">
          {team.badge && <img src={team.badge} alt="" />}
          <div>
            <div className="name">{team.name}</div>
            <div className="meta">
              {team.league} {team.venue ? `· ${team.venue}` : ""} {team.country ? `· ${team.country}` : ""}
            </div>
          </div>
        </div>
      </div>

      {isNba && <NbaStatsPanel teamName={team.name} />}

      <div className="panel">
        <h2>Plantel ({roster.length})</h2>
        {rosterLoading && <div className="empty-state">Cargando plantel…</div>}
        {rosterError && <div className="error-banner">{rosterError}</div>}
        {!rosterLoading && roster.length === 0 && !rosterError && (
          <div className="empty-state">Sin datos de plantel para este equipo.</div>
        )}
        <div className="roster-grid">
          {roster.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Últimos resultados</h2>
        {resultsLoading && <div className="empty-state">Cargando resultados…</div>}
        {resultsError && <div className="error-banner">{resultsError}</div>}
        {!resultsLoading && results.length === 0 && !resultsError && (
          <div className="empty-state">Sin resultados recientes registrados.</div>
        )}
        {results.length > 0 && (
          <table className="results-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Local</th>
                <th></th>
                <th>Visitante</th>
                <th>Competición</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const home = Number(r.homeScore);
                const away = Number(r.awayScore);
                const homeWon = r.homeScore !== null && r.awayScore !== null && home > away;
                const awayWon = r.homeScore !== null && r.awayScore !== null && away > home;
                return (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td className={homeWon ? "win" : awayWon ? "loss" : ""}>
                      {r.home} {r.homeScore ?? "-"}
                    </td>
                    <td>vs</td>
                    <td className={awayWon ? "win" : homeWon ? "loss" : ""}>
                      {r.awayScore ?? "-"} {r.away}
                    </td>
                    <td>{r.league}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
