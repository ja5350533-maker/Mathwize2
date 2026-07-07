import type { Player } from "../types";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="player-card">
      {player.thumb ? (
        <img src={player.thumb} alt="" />
      ) : (
        <div className="player-card img" style={{ width: 44, height: 44, borderRadius: 6, background: "var(--surface-1)" }} />
      )}
      <div>
        <div className="name">
          {player.number ? `#${player.number} ` : ""}
          {player.name}
        </div>
        {player.position && <div className="pos">{player.position}</div>}
        <div className="sub">
          {[player.nationality, player.height].filter(Boolean).join(" · ")}
        </div>
      </div>
    </div>
  );
}
