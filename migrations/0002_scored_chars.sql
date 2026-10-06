-- 마감 지난 글을 고쳐도 기록·EXP가 바뀌지 않도록 고정해 둔 글자 수
ALTER TABLE writings ADD COLUMN scored_chars INTEGER;
