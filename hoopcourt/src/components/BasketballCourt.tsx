import type { CourtSlot, Player } from "../types";

export const COURT_SLOTS: CourtSlot[] = [
  { id: "PG", label: "Base", top: "8%", left: "50%" },
  { id: "SG", label: "Escolta", top: "28%", left: "16%" },
  { id: "SF", label: "Alero", top: "28%", left: "84%" },
  { id: "PF", label: "Ala-Pívot", top: "64%", left: "26%" },
  { id: "C", label: "Pívot", top: "80%", left: "50%" },
];

interface Props {
  lineup: Record<string, Player | null>;
  dropHoverSlot: string | null;
  onSlotClick: (slotId: string) => void;
  onDragOverSlot: (e: React.DragEvent, slotId: string) => void;
  onDragLeaveSlot: () => void;
  onDropOnSlot: (e: React.DragEvent, slotId: string) => void;
  onDragStartSlot: (e: React.DragEvent, slotId: string) => void;
}

export default function BasketballCourt({
  lineup,
  dropHoverSlot,
  onSlotClick,
  onDragOverSlot,
  onDragLeaveSlot,
  onDropOnSlot,
  onDragStartSlot,
}: Props) {
  return (
    <div className="court-wrap">
      <svg className="court-svg" viewBox="0 0 300 400" preserveAspectRatio="none">
        <rect x="10" y="10" width="280" height="380" rx="4" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
        <rect x="110" y="250" width="80" height="140" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
        <circle cx="150" cy="250" r="45" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M25,390 A150,150 0 0 1 275,390" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
        <line x1="130" y1="376" x2="170" y2="376" stroke="var(--border-strong)" strokeWidth="3" />
        <circle cx="150" cy="382" r="6" fill="none" stroke="var(--series-orange)" strokeWidth="2" />
      </svg>

      {COURT_SLOTS.map((slot) => {
        const player = lineup[slot.id];
        const filled = Boolean(player);
        const hover = dropHoverSlot === slot.id;
        return (
          <div
            key={slot.id}
            className={`court-slot${filled ? " filled" : ""}${hover ? " drop-hover" : ""}`}
            style={{ top: slot.top, left: slot.left }}
            onClick={() => onSlotClick(slot.id)}
            onDragOver={(e) => onDragOverSlot(e, slot.id)}
            onDragLeave={onDragLeaveSlot}
            onDrop={(e) => onDropOnSlot(e, slot.id)}
            draggable={filled}
            onDragStart={(e) => onDragStartSlot(e, slot.id)}
          >
            {player ? (
              <>
                {player.thumb && <img src={player.thumb} alt="" />}
                <div className="slot-player">{player.name.split(" ").slice(-1)[0]}</div>
              </>
            ) : (
              <div className="slot-label">{slot.label}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
