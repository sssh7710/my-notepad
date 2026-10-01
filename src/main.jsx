import { StrictMode, useEffect, useReducer, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  COLOR_LABELS,
  NOTE_COLORS,
  cancelEdit,
  changeMemo,
  createMemo,
  deleteMemo,
  loadState,
  memoReducer,
  saveMemo,
  saveState,
  selectEditingCount,
  selectPinnedCount,
  selectVisibleMemos,
  setColor,
  setSearch,
  startEdit,
  togglePin,
} from './memo.js'
import './styles.css'

function formatToday() {
  return new Intl.DateTimeFormat('ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function pinClass(color) {
  if (color === 'mint' || color === 'sky') return 'pin pin-blue'
  if (color === 'peach' || color === 'lilac') return 'pin pin-white'
  return 'pin pin-red'
}

function Header({
  search,
  onSearch,
  onCreate,
  resultCount,
  totalCount,
  editingCount,
  pinnedCount,
}) {
  const searching = search.trim().length > 0

  return (
    <header className="toolbar">
      <div className="brand">
        <span className="brand-pin" aria-hidden="true" />
        <div>
          <p className="eyebrow">{formatToday()}</p>
          <h1>메모장</h1>
        </div>
      </div>

      <label className="search-field">
        <span className="search-label">메모 검색</span>
        <input
          id="memo-search"
          type="search"
          value={search}
          placeholder="제목이나 내용으로 찾기"
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>

      <div className="toolbar-side">
        <p className="stats">
          <span>{searching ? `검색 ${resultCount}` : `메모 ${totalCount}`}</span>
          {pinnedCount > 0 ? <span>고정 {pinnedCount}</span> : null}
          {editingCount > 0 ? <span>수정 중 {editingCount}</span> : null}
        </p>
        <button className="create-btn" type="button" onClick={onCreate}>
          새 메모
        </button>
      </div>
    </header>
  )
}

function MemoCard({ memo, dispatch }) {
  const titleRef = useRef(null)
  const [askingDelete, setAskingDelete] = useState(false)

  useEffect(() => {
    if (memo.isEditing && titleRef.current) {
      titleRef.current.focus()
    }
  }, [memo.isEditing])

  useEffect(() => {
    if (!memo.isEditing) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        dispatch(cancelEdit(memo.id))
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        dispatch(saveMemo(memo.id))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, memo.id, memo.isEditing])

  return (
    <article
      className={`memo memo-${memo.color} ${memo.isEditing ? 'is-editing' : ''} ${memo.pinned ? 'is-pinned' : ''}`}
    >
      <span className={pinClass(memo.color)} aria-hidden="true" />
      <div className="memo-tools">
        <button
          className={`tool-btn ${memo.pinned ? 'is-on' : ''}`}
          type="button"
          onClick={() => dispatch(togglePin(memo.id))}
        >
          {memo.pinned ? '고정됨' : '고정'}
        </button>
        <div className="color-dots" role="group" aria-label="메모 색">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              className={`color-dot memo-${color} ${memo.color === color ? 'is-selected' : ''}`}
              type="button"
              aria-label={COLOR_LABELS[color]}
              title={COLOR_LABELS[color]}
              onClick={() => dispatch(setColor(memo.id, color))}
            />
          ))}
        </div>
        {askingDelete ? (
          <span className="delete-ask">
            지울까요?
            <button
              className="tool-btn danger is-on"
              type="button"
              onClick={() => dispatch(deleteMemo(memo.id))}
            >
              지우기
            </button>
            <button className="tool-btn" type="button" onClick={() => setAskingDelete(false)}>
              아니요
            </button>
          </span>
        ) : (
          <button className="tool-btn danger" type="button" onClick={() => setAskingDelete(true)}>
            삭제
          </button>
        )}
      </div>

      {memo.isEditing ? (
        <>
          <input
            ref={titleRef}
            className="memo-title-input"
            value={memo.title}
            placeholder="제목을 입력하세요"
            onChange={(event) => dispatch(changeMemo(memo.id, 'title', event.target.value))}
          />
          <textarea
            className="memo-content-input"
            value={memo.content}
            placeholder="내용을 입력하세요"
            rows={6}
            onChange={(event) => dispatch(changeMemo(memo.id, 'content', event.target.value))}
          />
        </>
      ) : (
        <>
          <h2>{memo.title}</h2>
          <p className="memo-body">{memo.content || '내용 없음'}</p>
        </>
      )}

      <footer className="memo-footer">
        <time dateTime={new Date(memo.updatedAt).toISOString()}>{formatDate(memo.updatedAt)}</time>
        {memo.isEditing ? (
          <div className="memo-actions">
            <button className="edit-btn" type="button" onClick={() => dispatch(cancelEdit(memo.id))}>
              취소
            </button>
            <button className="save-btn" type="button" onClick={() => dispatch(saveMemo(memo.id))}>
              저장
            </button>
          </div>
        ) : (
          <button className="edit-btn" type="button" onClick={() => dispatch(startEdit(memo.id))}>
            수정
          </button>
        )}
      </footer>
    </article>
  )
}

function MemoBoard({ memos, dispatch, search, onCreate }) {
  const searching = search.trim().length > 0

  if (memos.length === 0) {
    return (
      <div className="empty-board">
        <article className="empty-note">
          <span className="pin pin-red" aria-hidden="true" />
          <h2>{searching ? '찾는 메모가 없어요' : '아직 붙여 둔 메모가 없어요'}</h2>
          <p>
            {searching
              ? '다른 단어로 검색하거나, 검색어를 지워 전체 메모를 보세요.'
              : '빈 종이를 붙이면 바로 적을 수 있어요.'}
          </p>
          {searching ? null : (
            <button className="save-btn" type="button" onClick={onCreate}>
              새 메모
            </button>
          )}
        </article>
      </div>
    )
  }

  return (
    <section className="board">
      {searching ? null : (
        <button className="add-tile" type="button" onClick={onCreate}>
          <span className="add-plus">+</span>
          <strong>새 메모 붙이기</strong>
          <span>빈 종이를 붙이면 바로 수정 모드로 열려요</span>
        </button>
      )}
      {memos.map((memo) => (
        <MemoCard key={memo.id} memo={memo} dispatch={dispatch} />
      ))}
    </section>
  )
}

function App() {
  const [state, dispatch] = useReducer(memoReducer, undefined, loadState)
  const visibleMemos = selectVisibleMemos(state)
  const editingCount = selectEditingCount(state)
  const pinnedCount = selectPinnedCount(state)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <div className="desk">
      <Header
        search={state.search}
        onSearch={(query) => dispatch(setSearch(query))}
        onCreate={() => dispatch(createMemo())}
        resultCount={visibleMemos.length}
        totalCount={state.memos.length}
        editingCount={editingCount}
        pinnedCount={pinnedCount}
      />
      <main className="corkboard">
        <MemoBoard
          memos={visibleMemos}
          dispatch={dispatch}
          search={state.search}
          onCreate={() => dispatch(createMemo())}
        />
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
