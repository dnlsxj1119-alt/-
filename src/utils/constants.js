export const DIFFICULTIES = {
  easy:   { label: '쉬움',   exp: 10, color: 'emerald' },
  normal: { label: '보통',   exp: 20, color: 'amber'   },
  hard:   { label: '어려움', exp: 30, color: 'rose'    },
}

export const HABIT_TYPES = {
  core: { label: '코어', icon: '⚡', desc: '크리처 EXP · HP · 스트릭에 영향' },
  life: { label: '라이프', icon: '🌿', desc: '서식지 아이템 언락 (페널티 없음)' },
}

export const CATEGORIES = ['건강', '학습', '운동', '마음', '생산성', '취미', '기타']

export const LIFE_MILESTONES = [
  { days: 7,  getName: (n) => `작은 ${n}`,   emoji_suffix: '' },
  { days: 21, getName: (n) => `${n} 장식품`,  emoji_suffix: '' },
  { days: 66, getName: (n) => `✨ 황금 ${n}`, emoji_suffix: '' },
]

export const CREATURE_STAGES = [
  { min: 0,    max: 500,      emoji: '🥚', sadEmoji: '🥚', name: '알',     stage: 1, desc: '따뜻하게 품어주세요!' },
  { min: 501,  max: 1500,     emoji: '🐣', sadEmoji: '🐣', name: '부화 중', stage: 2, desc: '조금씩 자라고 있어요!' },
  { min: 1501, max: 3500,     emoji: '🐥', sadEmoji: '😔', name: '새끼',   stage: 3, desc: '건강하게 자라고 있어요!' },
  { min: 3501, max: 7000,     emoji: '🦋', sadEmoji: '🥱', name: '성체',   stage: 4, desc: '아름답게 성장했어요!' },
  { min: 7001, max: Infinity, emoji: '✨', sadEmoji: '✨', name: '전설',   stage: 5, desc: '최강의 존재가 되었어요!' },
]

export const BADGES = [
  { id: 'streak7',  name: '7일 연속',  emoji: '🔥', requiredStreak: 7,  desc: '7일 연속 달성!' },
  { id: 'streak21', name: '21일 연속', emoji: '⭐', requiredStreak: 21, desc: '21일 연속 달성!' },
  { id: 'streak66', name: '66일 연속', emoji: '👑', requiredStreak: 66, desc: '66일 연속! 완전한 습관 형성!' },
]

export const EMOJI_CATEGORIES = [
  {
    label: '운동 · 건강',
    emojis: ['🏃','💪','🧘','🚴','🏋️','🤸','🏊','🧗','🚵','🏄','⛹️','🤾','🏇','🥊','⚽','🏀','🎾','🏸','🏓','🥋','🤺','🎿','🏂','🛹','🧜'],
  },
  {
    label: '음식 · 식습관',
    emojis: ['🥗','🥦','🍎','🍊','🍋','🫐','🥝','🍇','🥑','🥕','🥣','💧','🫖','☕','🍵','🧃','🥤','🍳','🥚','🫚'],
  },
  {
    label: '학습 · 생산성',
    emojis: ['📚','📖','✍️','🎯','💻','📝','🖊️','📐','📊','📈','🔬','🧪','🔭','💡','🧩','📋','🗂️','📌','🗓️','⌨️','🖥️','🖨️','📓','📔','📒'],
  },
  {
    label: '마음 · 웰빙',
    emojis: ['❤️','🧠','😴','🛌','🧸','🕯️','🌙','☀️','🌅','🌄','🌈','🫧','🫁','💆','💤','🙏','🧡','💛','💚','💙'],
  },
  {
    label: '취미 · 창작',
    emojis: ['🎨','🎵','🎸','🎹','🎺','🥁','🎻','🎤','🎬','📷','📸','🖌️','✂️','🧶','🪡','🧵','🎭','🎪','🎠','🎡'],
  },
  {
    label: '생활 · 루틴',
    emojis: ['🦷','🧴','🪥','🧼','🚿','🛁','🧹','🧺','🪣','🌿','🌱','🌻','🌸','🏠','🪴','🛒','🧾','📦','🔑','💳'],
  },
  {
    label: '자연 · 동물',
    emojis: ['🌍','🌊','🏔️','🌲','🍀','🌾','🍁','🦋','🐝','🌺','🌹','🌷','🐾','🐶','🐱','🐰','🦊','🦁','🐻','🐼'],
  },
  {
    label: '기타',
    emojis: ['⭐','🌟','💫','✨','🔥','💥','🎯','🎁','🎀','🏆','🥇','🎖️','🏅','💰','💎','🔮','🪄','🗝️','⚡','🌙'],
  },
]

export const EMOJIS = EMOJI_CATEGORIES.flatMap(c => c.emojis)

export const STORAGE_KEYS = {
  HABITS:   'hg_habits',
  LOGS:     'hg_logs',
  GAME_STATE: 'hg_state',
  DARK_MODE:  'hg_dark',
  HABITAT:    'hg_habitat',
}
