CREATE TABLE IF NOT EXISTS writings (
  date       TEXT PRIMARY KEY,   -- YYYY-MM-DD
  text       TEXT NOT NULL,
  goal       INTEGER NOT NULL,
  updated_at TEXT NOT NULL,      -- ISO timestamp, 최신 쪽이 이김
  deleted    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
