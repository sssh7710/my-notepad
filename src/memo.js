export const ACTION_TYPES = {
  CREATE_MEMO: 'CREATE_MEMO',
  START_EDIT: 'START_EDIT',
  CHANGE_MEMO: 'CHANGE_MEMO',
  SAVE_MEMO: 'SAVE_MEMO',
  CANCEL_EDIT: 'CANCEL_EDIT',
  DELETE_MEMO: 'DELETE_MEMO',
  SET_COLOR: 'SET_COLOR',
  TOGGLE_PIN: 'TOGGLE_PIN',
  SET_SEARCH: 'SET_SEARCH',
}

export const NOTE_COLORS = ['butter', 'mint', 'peach', 'sky', 'lilac']

export const COLOR_LABELS = {
  butter: '노랑',
  mint: '민트',
  peach: '복숭아',
  sky: '하늘',
  lilac: '보라',
}

const STORAGE_KEY = 'notepad-memos-v1'

function pickColor() {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
}

export function createMemo() {
  const now = Date.now()
  return {
    type: ACTION_TYPES.CREATE_MEMO,
    payload: {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      color: pickColor(),
    },
  }
}

export function startEdit(id) {
  return {
    type: ACTION_TYPES.START_EDIT,
    payload: { id },
  }
}

export function changeMemo(id, field, value) {
  return {
    type: ACTION_TYPES.CHANGE_MEMO,
    payload: { id, field, value },
  }
}

export function saveMemo(id) {
  return {
    type: ACTION_TYPES.SAVE_MEMO,
    payload: { id, updatedAt: Date.now() },
  }
}

export function cancelEdit(id) {
  return {
    type: ACTION_TYPES.CANCEL_EDIT,
    payload: { id },
  }
}

export function deleteMemo(id) {
  return {
    type: ACTION_TYPES.DELETE_MEMO,
    payload: { id },
  }
}

export function setColor(id, color) {
  return {
    type: ACTION_TYPES.SET_COLOR,
    payload: { id, color, updatedAt: Date.now() },
  }
}

export function togglePin(id) {
  return {
    type: ACTION_TYPES.TOGGLE_PIN,
    payload: { id },
  }
}

export function setSearch(query) {
  return {
    type: ACTION_TYPES.SET_SEARCH,
    payload: { query },
  }
}

const now = Date.now()

const SAMPLE_MEMOS = [
  {
    id: 'sample-1',
    title: '장보기',
    content: '우유 2개\n계란 한 판\n식빵, 바나나\n고추가루 떨어짐\n저녁엔 된장찌개',
    isEditing: false,
    isNew: false,
    pinned: false,
    color: 'butter',
    createdAt: now - 1000 * 60 * 60 * 26,
    updatedAt: now - 1000 * 60 * 60 * 26,
  },
  {
    id: 'sample-2',
    title: '공부 계획',
    content: 'CAR 패턴 복습\n- Component\n- Action\n- Reducer\n메모장 앱 저장/검색까지 연결하기',
    isEditing: false,
    isNew: false,
    pinned: true,
    color: 'mint',
    createdAt: now - 1000 * 60 * 60 * 10,
    updatedAt: now - 1000 * 60 * 60 * 8,
  },
  {
    id: 'sample-3',
    title: '아이디어',
    content: '메모지는 노란 종이처럼\n검색하면 맞는 것만 보이게\n수정 중일 땐 저장 버튼만',
    isEditing: false,
    isNew: false,
    pinned: false,
    color: 'peach',
    createdAt: now - 1000 * 60 * 50,
    updatedAt: now - 1000 * 60 * 30,
  },
  {
    id: 'sample-4',
    title: '주말 일정',
    content: '토: 도서관 오후 2시\n일: 엄마 전화\n빨래, 방 청소\n영화 하나 보기',
    isEditing: false,
    isNew: false,
    pinned: false,
    color: 'sky',
    createdAt: now - 1000 * 60 * 60 * 5,
    updatedAt: now - 1000 * 60 * 60 * 3,
  },
  {
    id: 'sample-5',
    title: '운동',
    content: '월수금 걷기 40분\n화목 스트레칭\n물 2리터\n자기 전 폰 멀리',
    isEditing: false,
    isNew: false,
    pinned: false,
    color: 'lilac',
    createdAt: now - 1000 * 60 * 60 * 40,
    updatedAt: now - 1000 * 60 * 60 * 12,
  },
  {
    id: 'sample-6',
    title: '볼 것 / 읽을 것',
    content: '기생충 다시 보기\n코스모스 도서관에서 빌리기\n유튜브 대신 책 30쪽',
    isEditing: false,
    isNew: false,
    pinned: false,
    color: 'butter',
    createdAt: now - 1000 * 60 * 90,
    updatedAt: now - 1000 * 60 * 20,
  },
]

export const initialState = {
  memos: SAMPLE_MEMOS,
  search: '',
}

function snapshot(memo) {
  return {
    title: memo.title,
    content: memo.content,
    color: memo.color,
  }
}

function restore(memo) {
  if (!memo.backup) {
    return { ...memo, isEditing: false, backup: undefined }
  }
  return {
    ...memo,
    title: memo.backup.title,
    content: memo.backup.content,
    color: memo.backup.color,
    isEditing: false,
    backup: undefined,
  }
}

function closeOtherEdits(memos, keepId) {
  return memos.flatMap((memo) => {
    if (memo.id === keepId || !memo.isEditing) return [memo]
    if (memo.isNew) return []
    return [restore(memo)]
  })
}

export function memoReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.CREATE_MEMO: {
      const memo = {
        id: action.payload.id,
        title: '',
        content: '',
        isEditing: true,
        isNew: true,
        pinned: false,
        color: action.payload.color,
        createdAt: action.payload.createdAt,
        updatedAt: action.payload.updatedAt,
        backup: { title: '', content: '', color: action.payload.color },
      }
      return {
        ...state,
        memos: [memo, ...closeOtherEdits(state.memos)],
      }
    }

    case ACTION_TYPES.START_EDIT:
      return {
        ...state,
        memos: closeOtherEdits(state.memos, action.payload.id).map((memo) =>
          memo.id === action.payload.id
            ? { ...memo, isEditing: true, backup: snapshot(memo) }
            : memo,
        ),
      }

    case ACTION_TYPES.CHANGE_MEMO:
      return {
        ...state,
        memos: state.memos.map((memo) => {
          if (memo.id !== action.payload.id || !memo.isEditing) return memo
          return { ...memo, [action.payload.field]: action.payload.value }
        }),
      }

    case ACTION_TYPES.SAVE_MEMO:
      return {
        ...state,
        memos: state.memos.map((memo) => {
          if (memo.id !== action.payload.id || !memo.isEditing) return memo
          const title = memo.title.trim() || '새 메모'
          return {
            ...memo,
            title,
            content: memo.content.trim(),
            isEditing: false,
            isNew: false,
            backup: undefined,
            updatedAt: action.payload.updatedAt,
          }
        }),
      }

    case ACTION_TYPES.CANCEL_EDIT:
      return {
        ...state,
        memos: state.memos.flatMap((memo) => {
          if (memo.id !== action.payload.id || !memo.isEditing) return [memo]
          if (memo.isNew) return []
          return [restore(memo)]
        }),
      }

    case ACTION_TYPES.DELETE_MEMO:
      return {
        ...state,
        memos: state.memos.filter((memo) => memo.id !== action.payload.id),
      }

    case ACTION_TYPES.SET_COLOR:
      return {
        ...state,
        memos: state.memos.map((memo) => {
          if (memo.id !== action.payload.id) return memo
          return {
            ...memo,
            color: action.payload.color,
            updatedAt: memo.isEditing ? memo.updatedAt : action.payload.updatedAt,
          }
        }),
      }

    case ACTION_TYPES.TOGGLE_PIN:
      return {
        ...state,
        memos: state.memos.map((memo) =>
          memo.id === action.payload.id ? { ...memo, pinned: !memo.pinned } : memo,
        ),
      }

    case ACTION_TYPES.SET_SEARCH:
      return {
        ...state,
        search: action.payload.query,
      }

    default:
      return state
  }
}

export function selectVisibleMemos(state) {
  const query = state.search.trim().toLowerCase()
  const filtered = query
    ? state.memos.filter((memo) => {
        const title = memo.title.toLowerCase()
        const content = memo.content.toLowerCase()
        return title.includes(query) || content.includes(query)
      })
    : state.memos

  return filtered.slice().sort((a, b) => Number(b.pinned) - Number(a.pinned))
}

export function selectEditingCount(state) {
  return state.memos.filter((memo) => memo.isEditing).length
}

export function selectPinnedCount(state) {
  return state.memos.filter((memo) => memo.pinned).length
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.memos)) return initialState

    return {
      search: '',
      memos: parsed.memos.map((memo) => ({
        id: memo.id,
        title: memo.title ?? '',
        content: memo.content ?? '',
        color: memo.color ?? 'butter',
        pinned: Boolean(memo.pinned),
        isNew: false,
        isEditing: false,
        createdAt: memo.createdAt ?? Date.now(),
        updatedAt: memo.updatedAt ?? Date.now(),
      })),
    }
  } catch {
    return initialState
  }
}

export function saveState(state) {
  const memos = state.memos.map((memo) => ({
    id: memo.id,
    title: memo.title,
    content: memo.content,
    color: memo.color,
    pinned: Boolean(memo.pinned),
    createdAt: memo.createdAt,
    updatedAt: memo.updatedAt,
  }))
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ memos }))
}
