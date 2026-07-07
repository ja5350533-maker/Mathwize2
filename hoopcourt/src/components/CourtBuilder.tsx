import { useEffect, useState } from "react";
import type { CourtSlotId, Player, TeamSummary } from "../types";
import BasketballCourt, { COURT_SLOTS } from "./BasketballCourt";

interface Props {
  team: TeamSummary;
  roster: Player[];
  rosterLoading: boolean;
  rosterError: string;
}

type Lineup = Record<CourtSlotId, Player | null>;

function emptyLineup(): Lineup {
  return { PG: null, SG: null, SF: null, PF: null, C: null };
}

export default function CourtBuilder({ team, roster, rosterLoading, rosterError }: Props) {
  const [lineup, setLineup] = useState<Lineup>(emptyLineup());
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null);
  const [dropHoverSlot, setDropHoverSlot] = useState<string | null>(null);

  const storageKey = `hoopcourt_lineup_${team.id}`;

  useEffect(() => {
    if (roster.length === 0) {
      setLineup(emptyLineup());
      return;
    }
    const raw = localStorage.getItem(storageKey);
    const resolved = emptyLineup();
    if (raw) {
      try {
        const saved: Partial<Record<CourtSlotId, string>> = JSON.parse(raw);
        for (const slot of COURT_SLOTS) {
          const pid = saved[slot.id];
          const player = pid ? roster.find((p) => p.id === pid) ?? null : null;
          resolved[slot.id] = player;
        }
      } catch {
        // ignore corrupt storage
      }
    }
    setLineup(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id, roster]);

  function persist(next: Lineup) {
    const map: Partial<Record<CourtSlotId, string>> = {};
    for (const slot of COURT_SLOTS) {
      if (next[slot.id]) map[slot.id] = next[slot.id]!.id;
    }
    localStorage.setItem(storageKey, JSON.stringify(map));
  }

  function placePlayerInSlot(playerId: string, slotId: CourtSlotId) {
    setLineup((prev) => {
      const next = { ...prev };
      (Object.keys(next) as CourtSlotId[]).forEach((key) => {
        if (next[key]?.id === playerId) next[key] = null;
      });
      const player =
        roster.find((p) => p.id === playerId) ??
        Object.values(prev).find((p) => p?.id === playerId) ??
        null;
      next[slotId] = player;
      persist(next);
      return next;
    });
  }

  function removeFromSlot(slotId: CourtSlotId) {
    setLineup((prev) => {
      const next = { ...prev, [slotId]: null };
      persist(next);
      return next;
    });
  }

  function resetLineup() {
    const next = emptyLineup();
    setLineup(next);
    localStorage.removeItem(storageKey);
  }

  const placedIds = new Set(Object.values(lineup).filter(Boolean).map((p) => p!.id));
  const bench = roster.filter((p) => !placedIds.has(p.id));

  function onSlotClick(slotId: string) {
    const id = slotId as CourtSlotId;
    if (selectedBenchId) {
      placePlayerInSlot(selectedBenchId, id);
      setSelectedBenchId(null);
    } else if (lineup[id]) {
      removeFromSlot(id);
    }
  }

  return (
    <div className="panel">
      <h2>Arma tu alineación — {team.name}</h2>
      {rosterLoading && <div className="empty-state">Cargando plantel…</div>}
      {rosterError && <div className="error-banner">{rosterError}</div>}
      {!rosterLoading && roster.length === 0 && !rosterError && (
        <div className="empty-state">Este equipo no tiene plantel disponible para armar alineación.</div>
      )}

      {roster.length > 0 && (
        <>
          <div className="court-layout">
            <div className="bench">
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Banca ({bench.length})
              </div>
              {bench.map((p) => (
                <div
                  key={p.id}
                  className={`bench-chip${selectedBenchId === p.id ? " selected" : ""}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
                  onClick={() => setSelectedBenchId((prev) => (prev === p.id ? null : p.id))}
                >
                  {p.thumb && <img src={p.thumb} alt="" />}
                  <span>
                    {p.name} {p.position ? `· ${p.position}` : ""}
                  </span>
                </div>
              ))}
              {bench.length === 0 && <div className="empty-state">Todo el plantel está en cancha.</div>}
              <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={resetLineup}>
                Vaciar cancha
              </button>
            </div>

            <BasketballCourt
              lineup={lineup}
              dropHoverSlot={dropHoverSlot}
              onSlotClick={onSlotClick}
              onDragOverSlot={(e, slotId) => {
                e.preventDefault();
                setDropHoverSlot(slotId);
              }}
              onDragLeaveSlot={() => setDropHoverSlot(null)}
              onDropOnSlot={(e, slotId) => {
                e.preventDefault();
                const playerId = e.dataTransfer.getData("text/plain");
                if (playerId) placePlayerInSlot(playerId, slotId as CourtSlotId);
                setDropHoverSlot(null);
              }}
              onDragStartSlot={(e, slotId) => {
                const player = lineup[slotId as CourtSlotId];
                if (player) e.dataTransfer.setData("text/plain", player.id);
              }}
            />
          </div>
          <div className="hint">
            Arrastra un jugador de la banca a la cancha, o tócalo para seleccionarlo y luego toca una posición.
            Toca un jugador ya ubicado para devolverlo a la banca.
          </div>
        </>
      )}
    </div>
  );
}
