import { useState } from "react";
import { searchTeams } from "../api/theSportsDb";
import type { TeamSummary } from "../types";

const NBA_QUICK_PICKS = [
  "Los Angeles Lakers",
  "Boston Celtics",
  "Golden State Warriors",
  "Miami Heat",
  "Denver Nuggets",
  "Milwaukee Bucks",
];

const WORLD_CUP_QUICK_PICKS = [
  "United States Basketball",
  "Spain Basketball",
  "Argentina Basketball",
  "Serbia Basketball",
  "France Basketball",
  "Germany Basketball",
];

export default function TeamSearch({ onSelect }: { onSelect: (team: TeamSummary) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(name: string) {
    const q = name.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    try {
      const teams = await searchTeams(q);
      setResults(teams);
      if (teams.length === 0) setError(`Sin resultados para "${q}". Prueba con el nombre completo en inglés.`);
    } catch {
      setError("No se pudo consultar TheSportsDB. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Buscar equipo — NBA, Mundial FIBA u otro</h2>
      <div className="field-row">
        <input
          className="text-input"
          placeholder="Ej: Lakers, Spain Basketball, EuroLeague club…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
        />
        <button className="btn" disabled={loading} onClick={() => runSearch(query)}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      <div className="field-row" style={{ marginBottom: 4 }}>
        {NBA_QUICK_PICKS.map((name) => (
          <button key={name} className="chip" onClick={() => runSearch(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="field-row">
        {WORLD_CUP_QUICK_PICKS.map((name) => (
          <button key={name} className="chip" onClick={() => runSearch(name)}>
            {name.replace(" Basketball", "")} 🌍
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {results.length > 0 && (
        <div className="result-list">
          {results.map((t) => (
            <button key={t.id} className="result-row" onClick={() => onSelect(t)}>
              {t.badge && <img src={t.badge} alt="" />}
              <div>
                <div className="name">{t.name}</div>
                <div className="meta">
                  {t.league} {t.country ? `· ${t.country}` : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
