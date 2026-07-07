import { useEffect, useState } from "react";
import TeamSearch from "./components/TeamSearch";
import TeamStatsPanel from "./components/TeamStatsPanel";
import CourtBuilder from "./components/CourtBuilder";
import { getTeamRoster } from "./api/theSportsDb";
import type { Player, TeamSummary } from "./types";

type Tab = "stats" | "court";

export default function App() {
  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [tab, setTab] = useState<Tab>("stats");
  const [roster, setRoster] = useState<Player[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState("");

  useEffect(() => {
    if (!team) return;
    let cancelled = false;
    setRosterLoading(true);
    setRosterError("");
    setRoster([]);
    getTeamRoster(team.id)
      .then((r) => !cancelled && setRoster(r))
      .catch(() => !cancelled && setRosterError("No se pudo cargar el plantel de este equipo."))
      .finally(() => !cancelled && setRosterLoading(false));
    return () => {
      cancelled = true;
    };
  }, [team]);

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          <span className="ball">🏀</span> HoopCourt
        </div>
        {team && (
          <div className="tabs">
            <button className={`tab-btn${tab === "stats" ? " active" : ""}`} onClick={() => setTab("stats")}>
              Estadísticas
            </button>
            <button className={`tab-btn${tab === "court" ? " active" : ""}`} onClick={() => setTab("court")}>
              Cancha
            </button>
          </div>
        )}
        {team && (
          <button className="btn btn-ghost" onClick={() => setTeam(null)}>
            Cambiar equipo
          </button>
        )}
      </header>

      <main className="app-body">
        {!team && <TeamSearch onSelect={setTeam} />}
        {team && tab === "stats" && (
          <TeamStatsPanel team={team} roster={roster} rosterLoading={rosterLoading} rosterError={rosterError} />
        )}
        {team && tab === "court" && (
          <CourtBuilder team={team} roster={roster} rosterLoading={rosterLoading} rosterError={rosterError} />
        )}
      </main>
    </>
  );
}
