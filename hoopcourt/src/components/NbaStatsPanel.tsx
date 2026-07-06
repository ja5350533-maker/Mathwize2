import { useEffect, useState } from "react";
import { BallDontLieError, getSeasonAverages, searchNbaPlayers } from "../api/ballDontLie";
import type { SeasonAverage } from "../types";

const KEY_STORAGE = "hoopcourt_bdl_key";
const CURRENT_SEASON = 2024;

export default function NbaStatsPanel({ teamName }: { teamName: string }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [averages, setAverages] = useState<SeasonAverage[] | null>(null);

  useEffect(() => {
    localStorage.setItem(KEY_STORAGE, apiKey);
  }, [apiKey]);

  async function loadStats() {
    if (!apiKey.trim()) {
      setError("Pega tu clave gratuita de balldontlie.io para ver promedios de temporada.");
      return;
    }
    setLoading(true);
    setError("");
    setAverages(null);
    try {
      const players = await searchNbaPlayers(apiKey.trim(), teamName.replace(" Basketball", ""));
      if (players.length === 0) {
        setError("balldontlie.io no encontró jugadores para este equipo (solo cubre la NBA).");
        return;
      }
      const data = await getSeasonAverages(apiKey.trim(), CURRENT_SEASON, players.slice(0, 8));
      if (data.length === 0) {
        setError("Sin promedios disponibles para esta temporada todavía.");
      }
      setAverages(data);
    } catch (e) {
      setError(e instanceof BallDontLieError ? e.message : "No se pudo conectar con balldontlie.io.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Promedios NBA (balldontlie.io) — opcional</h2>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 10px" }}>
        Requiere una clave gratuita propia (regístrate en balldontlie.io). Solo cubre equipos y
        jugadores de la NBA, y algunos endpoints de estadísticas avanzadas son de pago.
      </p>
      <div className="field-row">
        <input
          className="text-input"
          type="password"
          placeholder="Tu clave de API de balldontlie.io"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button className="btn" onClick={loadStats} disabled={loading}>
          {loading ? "Cargando…" : "Ver promedios"}
        </button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {averages && averages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {averages.map((a) => (
            <div key={a.playerId}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{a.playerName}</div>
              <div className="stat-tiles">
                <StatTile label="PTS" value={a.pts} />
                <StatTile label="REB" value={a.reb} />
                <StatTile label="AST" value={a.ast} />
                <StatTile label="STL" value={a.stl} />
                <StatTile label="BLK" value={a.blk} />
                <StatTile label="FG%" value={a.fgPct !== null ? a.fgPct * 100 : null} suffix="%" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div className="stat-tile">
      <div className="value">{value !== null ? value.toFixed(1) + suffix : "—"}</div>
      <div className="label">{label}</div>
    </div>
  );
}
