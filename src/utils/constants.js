export const GOAL_OPTIONS = [100, 300, 500, 1000]
export const DEFAULT_GOAL = 300

// 목표 달성 시 기본 EXP, 초과 100자당 보너스 (상한 있음), 목표 미달이어도 쓰면 소량 EXP
export const EXP_RULES = {
  goalBase: 20,
  bonusPer100: 2,
  bonusCap: 20,
  partial: 5,
}

export const CREATURE_STAGES = [
  { min: 0,    max: 300,      emoji: '🥚', sadEmoji: '🥚', name: '알',     stage: 1, desc: '따뜻하게 품어주세요!' },
  { min: 301,  max: 900,      emoji: '🐣', sadEmoji: '🐣', name: '부화 중', stage: 2, desc: '조금씩 자라고 있어요!' },
  { min: 901,  max: 2100,     emoji: '🐥', sadEmoji: '😔', name: '새끼',   stage: 3, desc: '건강하게 자라고 있어요!' },
  { min: 2101, max: 5500,     emoji: '🦋', sadEmoji: '🥱', name: '성체',   stage: 4, desc: '아름답게 성장했어요!' },
  { min: 5501, max: Infinity, emoji: '✨', sadEmoji: '✨', name: '전설',   stage: 5, desc: '최강의 존재가 되었어요!' },
]

export const BADGES = [
  { id: 'streak7',  name: '7일 연속',  emoji: '🔥', requiredStreak: 7,  desc: '7일 연속 글쓰기!' },
  { id: 'streak21', name: '21일 연속', emoji: '⭐', requiredStreak: 21, desc: '21일 연속 글쓰기!' },
  { id: 'streak66', name: '66일 연속', emoji: '👑', requiredStreak: 66, desc: '66일 연속! 완전한 습관 형성!' },
]

export const WRITING_PROMPTS = [
  '오늘 가장 오래 머문 생각은?',
  '최근에 나를 웃게 만든 장면',
  '요즘 자꾸 미루고 있는 일과 그 이유',
  '어릴 때 살던 동네의 한 장면',
  '지금 창밖에 보이는 것을 자세히 묘사하기',
  '1년 전의 나에게 해주고 싶은 말',
  '오늘 들은 말 중 기억에 남는 한마디',
  '요즘 빠져 있는 것',
  '내가 좋아하는 계절과 그 냄새',
  '최근에 바뀐 생각 하나',
  '오늘 하루를 세 문장으로 요약한다면',
  '가장 아끼는 물건에 얽힌 이야기',
  '나를 지치게 하는 것과 회복시키는 것',
  '요즘 배우고 싶은 것',
  '오늘 먹은 음식 중 하나에 대해',
  '누군가에게 고마웠던 순간',
  '내가 생각하는 좋은 하루의 조건',
  '최근에 본 영상·책·글에서 남은 것',
  '10년 뒤 평범한 하루를 상상해보기',
  '요즘 나를 불안하게 하는 것',
  '오늘 내가 잘한 일 하나',
  '지금 듣고 있는 소리들',
  '처음 해본 일에 대한 기억',
  '내가 자주 쓰는 말버릇',
  '오늘 마주친 사람 한 명을 관찰하듯 써보기',
  '포기했지만 아직 마음에 남은 것',
  '요즘 일에서 느끼는 것',
  '나만 아는 작은 즐거움',
  '오늘의 날씨와 기분의 관계',
  '자유 주제 — 아무거나 써도 좋아요',
]

export const STORAGE_KEYS = {
  WRITINGS:  'wg_writings',
  SETTINGS:  'wg_settings',
  NOTIF:     'wg_notif',
  DARK_MODE: 'hg_dark',
}
