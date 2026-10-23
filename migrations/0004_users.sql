-- 여러 사람이 각자 계정으로 쓰도록: 사용자·세션 테이블, 글·설정에 user_id 추가
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pw_hash    TEXT NOT NULL,
  pw_salt    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,   -- 토큰 원문은 저장하지 않음
  user_id    INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

-- 비밀번호 하나로 쓰던 시절 글은 user_id 0 으로 보관 (주인 계정으로 옮겨줄 것)
CREATE TABLE writings_v2 (
  user_id      INTEGER NOT NULL,
  date         TEXT NOT NULL,
  text         TEXT NOT NULL,
  rebuttal     TEXT NOT NULL DEFAULT '',
  goal         INTEGER NOT NULL,
  updated_at   TEXT NOT NULL,
  deleted      INTEGER NOT NULL DEFAULT 0,
  scored_chars INTEGER,
  PRIMARY KEY (user_id, date)
);
INSERT INTO writings_v2 (user_id, date, text, rebuttal, goal, updated_at, deleted, scored_chars)
  SELECT 0, date, text, rebuttal, goal, updated_at, deleted, scored_chars FROM writings;
DROP TABLE writings;
ALTER TABLE writings_v2 RENAME TO writings;

CREATE TABLE settings_v2 (
  user_id INTEGER NOT NULL,
  key     TEXT NOT NULL,
  value   TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);
INSERT INTO settings_v2 (user_id, key, value) SELECT 0, key, value FROM settings;
DROP TABLE settings;
ALTER TABLE settings_v2 RENAME TO settings;
