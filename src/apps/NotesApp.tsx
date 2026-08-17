import { useEffect, useMemo, useRef, useState } from 'react'
import { FilePlus2, Search, StickyNote, Trash2, X } from 'lucide-react'
import type { AppRuntimeProps } from '../types'
import { appAccentStyle, createId, IconButton, SaveState } from './shared'

interface NoteItem {
  id: string
  title: string
  content: string
  updatedAt: number
}

const NOTES_KEY = 'aster-os.notes.v1'

const starterNotes: NoteItem[] = [
  {
    id: 'welcome-note',
    title: '欢迎使用记事本',
    content: '所有内容都会自动保存在这台设备上。\n\n从记录一个想法开始吧。',
    updatedAt: Date.now(),
  },
  {
    id: 'today-note',
    title: '今日待办',
    content: '整理项目思路\n完成一次 25 分钟专注\n回顾今天的进度',
    updatedAt: Date.now() - 1000 * 60 * 25,
  },
]

function loadNotes(): { notes: NoteItem[]; error: string | null } {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return { notes: starterNotes, error: null }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('invalid notes')
    const notes = parsed.filter(
      (item): item is NoteItem =>
        Boolean(
          item &&
            typeof item === 'object' &&
            'id' in item &&
            'title' in item &&
            'content' in item &&
            'updatedAt' in item &&
            typeof item.id === 'string' &&
            typeof item.title === 'string' &&
            typeof item.content === 'string' &&
            typeof item.updatedAt === 'number',
        ),
    )
    return { notes, error: notes.length === parsed.length ? null : '部分损坏的笔记已忽略。' }
  } catch {
    return { notes: starterNotes, error: '无法读取之前的笔记，已恢复默认内容。' }
  }
}

function formatNoteTime(timestamp: number) {
  const date = new Date(timestamp)
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  return new Intl.DateTimeFormat('zh-CN', sameDay ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' }).format(date)
}

export function NotesApp({ notify, settings }: AppRuntimeProps) {
  const initial = useMemo(loadNotes, [])
  const [notes, setNotes] = useState(initial.notes)
  const [selectedId, setSelectedId] = useState(initial.notes[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [loadError, setLoadError] = useState(initial.error)
  const [deleteArmed, setDeleteArmed] = useState(false)
  const notesRef = useRef(notes)
  const selectedNote = notes.find((note) => note.id === selectedId) ?? null

  const visibleNotes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN')
    if (!normalized) return notes
    return notes.filter((note) => `${note.title}\n${note.content}`.toLocaleLowerCase('zh-CN').includes(normalized))
  }, [notes, query])

  useEffect(() => {
    notesRef.current = notes
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 320)
    return () => window.clearTimeout(timer)
  }, [notes])

  useEffect(() => {
    return () => {
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notesRef.current))
      } catch {
        // The app is closing, so there is no remaining surface for an error message.
      }
    }
  }, [])

  function createNote() {
    const note: NoteItem = {
      id: createId('note'),
      title: '无标题笔记',
      content: '',
      updatedAt: Date.now(),
    }
    setNotes((items) => {
      const next = [note, ...items]
      notesRef.current = next
      return next
    })
    setSelectedId(note.id)
    setQuery('')
    setDeleteArmed(false)
    notify('已新建笔记', '输入内容后会自动保存。')
  }

  function updateSelected(patch: Partial<Pick<NoteItem, 'title' | 'content'>>) {
    if (!selectedId) return
    setNotes((items) => {
      const next = items.map((note) =>
        note.id === selectedId ? { ...note, ...patch, updatedAt: Date.now() } : note,
      )
      notesRef.current = next
      return next
    })
    setDeleteArmed(false)
  }

  function deleteSelected() {
    if (!selectedNote) return
    const remaining = notes.filter((note) => note.id !== selectedNote.id)
    notesRef.current = remaining
    setNotes(remaining)
    setSelectedId(remaining[0]?.id ?? null)
    setDeleteArmed(false)
    notify('笔记已删除', `“${selectedNote.title || '无标题笔记'}”已移除。`)
  }

  return (
    <section
      className={`os-app os-app--${settings.theme} notes-app`}
      style={appAccentStyle(settings)}
      aria-label="记事本"
    >
      <aside className="notes-sidebar">
        <header className="notes-sidebar__header">
          <div>
            <h1>记事本</h1>
            <span>{notes.length} 篇笔记</span>
          </div>
          <IconButton label="新建笔记" onClick={createNote}>
            <FilePlus2 size={18} />
          </IconButton>
        </header>
        <label className="app-search-field notes-search">
          <Search size={15} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索笔记"
            aria-label="搜索笔记"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="清除搜索" title="清除搜索">
              <X size={14} />
            </button>
          )}
        </label>
        {loadError && (
          <button className="app-inline-error" type="button" onClick={() => setLoadError(null)}>
            <span>{loadError}</span><X size={14} />
          </button>
        )}
        <div className="notes-list app-scroll-area">
          {visibleNotes.map((note) => (
            <button
              type="button"
              key={note.id}
              className={`notes-list__item${note.id === selectedId ? ' is-selected' : ''}`}
              onClick={() => {
                setSelectedId(note.id)
                setDeleteArmed(false)
              }}
            >
              <strong>{note.title.trim() || '无标题笔记'}</strong>
              <span>{note.content.trim().split('\n')[0] || '还没有内容'}</span>
              <time dateTime={new Date(note.updatedAt).toISOString()}>{formatNoteTime(note.updatedAt)}</time>
            </button>
          ))}
          {visibleNotes.length === 0 && notes.length > 0 && (
            <div className="notes-list__empty">
              <Search size={20} />
              <p>没有匹配“{query}”的笔记。</p>
            </div>
          )}
        </div>
      </aside>

      <main className="notes-editor">
        {selectedNote ? (
          <>
            <header className="app-toolbar notes-editor__toolbar">
              <SaveState state={saveState} />
              <span className="app-toolbar__spacer" />
              {deleteArmed ? (
                <div className="notes-delete-confirm" role="group" aria-label="确认删除笔记">
                  <span>删除这篇笔记？</span>
                  <button type="button" onClick={() => setDeleteArmed(false)}>取消</button>
                  <button type="button" className="is-danger" onClick={deleteSelected}>删除</button>
                </div>
              ) : (
                <IconButton label="删除笔记" onClick={() => setDeleteArmed(true)}>
                  <Trash2 size={17} />
                </IconButton>
              )}
            </header>
            <div className="notes-editor__body">
              <input
                className="notes-title"
                value={selectedNote.title}
                onChange={(event) => updateSelected({ title: event.target.value })}
                placeholder="笔记标题"
                aria-label="笔记标题"
              />
              <div className="notes-meta">
                {new Intl.DateTimeFormat('zh-CN', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                }).format(selectedNote.updatedAt)}
                <span>·</span>
                {selectedNote.content.replace(/\s/g, '').length} 字
              </div>
              <textarea
                value={selectedNote.content}
                onChange={(event) => updateSelected({ content: event.target.value })}
                placeholder="写下此刻的想法…"
                aria-label="笔记内容"
              />
            </div>
          </>
        ) : (
          <div className="app-empty-state">
            <StickyNote size={36} />
            <h1>还没有笔记</h1>
            <p>新建一篇笔记，内容会自动保存。</p>
            <button className="app-primary-button" type="button" onClick={createNote}>
              <FilePlus2 size={16} /> 新建笔记
            </button>
          </div>
        )}
      </main>
    </section>
  )
}

