import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  FilePlus2,
  Italic,
  List,
  ListOrdered,
  Save,
  Underline,
} from 'lucide-react'
import type { AppRuntimeProps } from '../types'
import { appAccentStyle, createId, IconButton, SaveState } from './shared'

const WRITER_KEY = 'aster-os.writer.v2'
const LEGACY_WRITER_KEY = 'aster-os.writer.v1'
const EMPTY_DOCUMENT = '<h1>无标题文档</h1><p><br></p>'
const STARTER_DOCUMENT = `
  <h1>一份新文档</h1>
  <p>从这里开始写作。你的内容会自动保存在本地。</p>
  <h2>清晰表达</h2>
  <p>一次只写一个重点，使用工具栏调整层级、强调和对齐方式。</p>
`

interface WriterDocument {
  id: string
  title: string
  html: string
  updatedAt: number
}

interface WriterStore {
  activeId: string
  documents: WriterDocument[]
}

function getDocumentTitle(html: string) {
  const element = document.createElement('div')
  element.innerHTML = html
  const heading = element.querySelector('h1')?.textContent?.trim()
  const firstLine = element.textContent?.trim().split(/\n+/)[0]?.trim()
  return (heading || firstLine || '无标题文档').slice(0, 36)
}

function createDocument(html = EMPTY_DOCUMENT): WriterDocument {
  return {
    id: createId('document'),
    title: getDocumentTitle(html),
    html,
    updatedAt: Date.now(),
  }
}

function isWriterDocument(value: unknown): value is WriterDocument {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<WriterDocument>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.html === 'string' &&
    typeof item.updatedAt === 'number'
  )
}

function loadDocuments() {
  try {
    const raw = localStorage.getItem(WRITER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WriterStore>
      const documents = Array.isArray(parsed.documents)
        ? parsed.documents.filter(isWriterDocument)
        : []
      if (documents.length > 0) {
        const activeId = documents.some((item) => item.id === parsed.activeId)
          ? parsed.activeId as string
          : documents[0].id
        return { documents, activeId, error: null as string | null }
      }
    }

    const legacyHtml = localStorage.getItem(LEGACY_WRITER_KEY) || STARTER_DOCUMENT
    const documentItem = createDocument(legacyHtml)
    return { documents: [documentItem], activeId: documentItem.id, error: null as string | null }
  } catch {
    const documentItem = createDocument(STARTER_DOCUMENT)
    return {
      documents: [documentItem],
      activeId: documentItem.id,
      error: '无法读取之前保存的文档。',
    }
  }
}

function updateCurrentDocument(
  documents: WriterDocument[],
  activeId: string,
  html: string,
) {
  return documents.map((item) =>
    item.id === activeId
      ? { ...item, title: getDocumentTitle(html), html, updatedAt: Date.now() }
      : item,
  )
}

function persistStore(documents: WriterDocument[], activeId: string) {
  localStorage.setItem(WRITER_KEY, JSON.stringify({ documents, activeId } satisfies WriterStore))
}

function getTextMetrics(html: string) {
  const element = document.createElement('div')
  element.innerHTML = html
  const text = element.textContent?.trim() ?? ''
  const words = text.match(/[\u3400-\u9fff]|[a-zA-Z0-9]+(?:['-][a-zA-Z0-9]+)*/g) ?? []
  return { words: words.length, characters: text.replace(/\s/g, '').length }
}

type CommandState = Record<'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList', boolean>

const emptyCommandState: CommandState = {
  bold: false,
  italic: false,
  underline: false,
  insertUnorderedList: false,
  insertOrderedList: false,
}

export function WriterApp({ notify, settings }: AppRuntimeProps) {
  const initial = useMemo(loadDocuments, [])
  const initialDocument = initial.documents.find((item) => item.id === initial.activeId) ?? initial.documents[0]
  const [documents, setDocuments] = useState(initial.documents)
  const [activeId, setActiveId] = useState(initialDocument.id)
  const [html, setHtml] = useState(initialDocument.html)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [loadError, setLoadError] = useState(initial.error)
  const [activeCommands, setActiveCommands] = useState<CommandState>(emptyCommandState)
  const editorRef = useRef<HTMLDivElement>(null)
  const documentsRef = useRef(documents)
  const activeIdRef = useRef(activeId)
  const htmlRef = useRef(html)
  const metrics = useMemo(() => getTextMetrics(html), [html])

  useEffect(() => {
    const updateToolbar = () => {
      const selection = window.getSelection()
      if (!selection?.anchorNode || !editorRef.current?.contains(selection.anchorNode)) return
      setActiveCommands({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      })
    }
    document.addEventListener('selectionchange', updateToolbar)
    return () => document.removeEventListener('selectionchange', updateToolbar)
  }, [])

  useEffect(() => {
    htmlRef.current = html
    setSaveState('saving')
    const timer = window.setTimeout(() => saveDocument(false), 420)
    return () => window.clearTimeout(timer)
  }, [html])

  useEffect(() => {
    return () => {
      try {
        const next = updateCurrentDocument(
          documentsRef.current,
          activeIdRef.current,
          htmlRef.current,
        )
        persistStore(next, activeIdRef.current)
      } catch {
        // The editor is already closing, so no error surface remains available.
      }
    }
  }, [])

  function saveDocument(showNotice: boolean) {
    try {
      const next = updateCurrentDocument(
        documentsRef.current,
        activeIdRef.current,
        htmlRef.current,
      )
      documentsRef.current = next
      setDocuments(next)
      persistStore(next, activeIdRef.current)
      setSaveState('saved')
      if (showNotice) notify('文档已保存', '最新内容已存储在这台设备上。')
      return next
    } catch {
      setSaveState('error')
      if (showNotice) notify('保存失败', '请检查浏览器的本地存储权限。')
      return documentsRef.current
    }
  }

  function syncEditor() {
    const nextHtml = editorRef.current?.innerHTML ?? ''
    htmlRef.current = nextHtml
    setHtml(nextHtml)
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    syncEditor()
  }

  function selectDocument(nextId: string) {
    const savedDocuments = saveDocument(false)
    const nextDocument = savedDocuments.find((item) => item.id === nextId)
    if (!nextDocument) return
    activeIdRef.current = nextDocument.id
    htmlRef.current = nextDocument.html
    setActiveId(nextDocument.id)
    setHtml(nextDocument.html)
    if (editorRef.current) editorRef.current.innerHTML = nextDocument.html
    persistStore(savedDocuments, nextDocument.id)
  }

  function newDocument() {
    const savedDocuments = saveDocument(false)
    const documentItem = createDocument()
    const nextDocuments = [documentItem, ...savedDocuments]
    documentsRef.current = nextDocuments
    activeIdRef.current = documentItem.id
    htmlRef.current = documentItem.html
    setDocuments(nextDocuments)
    setActiveId(documentItem.id)
    setHtml(documentItem.html)
    if (editorRef.current) editorRef.current.innerHTML = documentItem.html
    persistStore(nextDocuments, documentItem.id)
    notify('已新建文档', '原文档仍可从标题菜单中打开。')
    window.requestAnimationFrame(() => editorRef.current?.focus())
  }

  return (
    <section
      className={`os-app os-app--${settings.theme} writer-app`}
      style={appAccentStyle(settings)}
      aria-label="文档编辑器"
    >
      <header className="writer-menubar">
        <div className="writer-document-title">
          <select
            aria-label="当前文档"
            value={activeId}
            onChange={(event) => selectDocument(event.target.value)}
          >
            {documents.map((item) => (
              <option value={item.id} key={item.id}>{item.title}</option>
            ))}
          </select>
          <SaveState state={saveState} />
        </div>
        <div className="app-toolbar__group">
          <IconButton label="新建文档" onClick={newDocument}>
            <FilePlus2 size={17} />
          </IconButton>
          <button className="app-text-button app-text-button--compact" type="button" onClick={() => saveDocument(true)}>
            <Save size={15} /> 保存
          </button>
        </div>
      </header>

      {loadError && (
        <div className="app-error-banner" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={() => setLoadError(null)}>关闭</button>
        </div>
      )}

      <div className="app-toolbar writer-toolbar" role="toolbar" aria-label="文字格式">
        <select
          aria-label="段落样式"
          defaultValue="p"
          onChange={(event) => runCommand('formatBlock', event.target.value)}
        >
          <option value="p">正文</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="blockquote">引用</option>
        </select>
        <span className="writer-toolbar__divider" aria-hidden="true" />
        <IconButton label="粗体" active={activeCommands.bold} onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('bold')}>
          <Bold size={16} />
        </IconButton>
        <IconButton label="斜体" active={activeCommands.italic} onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('italic')}>
          <Italic size={16} />
        </IconButton>
        <IconButton label="下划线" active={activeCommands.underline} onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('underline')}>
          <Underline size={16} />
        </IconButton>
        <span className="writer-toolbar__divider" aria-hidden="true" />
        <IconButton label="无序列表" active={activeCommands.insertUnorderedList} onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('insertUnorderedList')}>
          <List size={16} />
        </IconButton>
        <IconButton label="有序列表" active={activeCommands.insertOrderedList} onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered size={16} />
        </IconButton>
        <span className="writer-toolbar__divider" aria-hidden="true" />
        <IconButton label="左对齐" onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('justifyLeft')}>
          <AlignLeft size={16} />
        </IconButton>
        <IconButton label="居中对齐" onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('justifyCenter')}>
          <AlignCenter size={16} />
        </IconButton>
        <IconButton label="右对齐" onPointerDown={(event) => event.preventDefault()} onClick={() => runCommand('justifyRight')}>
          <AlignRight size={16} />
        </IconButton>
      </div>

      <main className="writer-workspace app-scroll-area">
        <div
          key={activeId}
          ref={editorRef}
          className="writer-page"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="文档内容"
          aria-multiline="true"
          spellCheck
          onInput={syncEditor}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <footer className="app-statusbar writer-statusbar">
        <span>{metrics.words} 字词</span>
        <span>{metrics.characters} 字符</span>
        <span className="app-statusbar__grow" />
        <span>{documents.length} 份本地文档</span>
      </footer>
    </section>
  )
}

