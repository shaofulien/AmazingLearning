// SM-2 spaced repetition with Anki-style four grades.
export type Grade = "again" | "hard" | "good" | "easy";

export interface SrsState {
  ease: number;
  interval_days: number;
  reps: number;
}

export function nextReview(state: SrsState, grade: Grade): SrsState & { due_at: Date } {
  let { ease, interval_days: interval, reps } = state;

  if (grade === "again") {
    reps = 0;
    interval = 0; // back to learning: due again in 10 minutes
    ease = Math.max(1.3, ease - 0.2);
    return { ease, interval_days: interval, reps, due_at: addMinutes(10) };
  }

  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = reps === 0 ? 1 : Math.max(1, interval * 1.2);
  } else if (grade === "good") {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : interval * ease;
  } else {
    ease = ease + 0.15;
    interval = reps === 0 ? 2 : reps === 1 ? 4 : interval * ease * 1.3;
  }
  reps += 1;
  interval = Math.min(Math.round(interval * 10) / 10, 365);
  return { ease, interval_days: interval, reps, due_at: addDays(interval) };
}

function addMinutes(m: number) {
  return new Date(Date.now() + m * 60_000);
}
function addDays(d: number) {
  return new Date(Date.now() + d * 86_400_000);
}

// SQLite datetime('now') format, in UTC
export function toSqlite(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ");
}
