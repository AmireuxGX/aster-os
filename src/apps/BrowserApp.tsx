import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  ExternalLink,
  Home,
  LockKeyhole,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import type { AppId, AppRuntimeProps } from '../types'
import { appAccentStyle, IconButton, normalizeExternalUrl } from './shared'

type PageKind = 'start' | 'guide' | 'focus' | 'library' | 'search' | 'error'

interface BrowserEntry {
  url: string
  title: string
  kind: PageKind
}

const HOME_ENTRY: BrowserEntry = {
  url: 'aster://start',
  title: 'Aster 起始页',
  kind: 'start',
}

const INTERNAL_PAGES: Record<string, BrowserEntry> = {
  'aster://start': HOME_ENTRY,
  'aster://guide': {
    url: 'aster://guide',
    title: '系统使用指南',
    kind: 'guide',
  },
  'aster://focus': {
    url: 'aster://focus',
    title: '今日专注',
    kind: 'focus',
  },
  'aster://library': {
    url: 'aster://library',
    title: '精选资源',
    kind: 'library',
  },
}

interface SearchItem {
  title: string
  description: string
  terms: string
  url?: string
  appId?: AppId
}

const SEARCH_ITEMS: SearchItem[] = [
  { title: '系统使用指南', description: '窗口、应用、Dock 与浏览器的基本操作。', terms: '系统 指南 窗口 应用 桌面 dock 快捷键 浏览器', url: 'aster://guide' },
  { title: '今日专注', description: '用一次 25 分钟专注时段完成重要任务。', terms: '专注 focus 25 分钟 任务 勿扰', url: 'aster://focus' },
  { title: '精选资源', description: '访问开发、设计与无障碍文档。', terms: '资源 开发 设计 文档 mdn react w3c', url: 'aster://library' },
  { title: '终端', description: '运行 Aster 命令并快速打开应用。', terms: '终端 terminal 命令 command shell 控制台', appId: 'terminal' },
  { title: '记事本', description: '记录、搜索并自动保存多篇笔记。', terms: '记事本 notes 笔记 便笺 记录', appId: 'notes' },
  { title: '计算器', description: '计算表达式并查看历史记录。', terms: '计算器 calculator calc 数学 运算', appId: 'calculator' },
  { title: '文档', description: '创建富文本内容并在本地保存。', terms: '文档 writer 写作 编辑 富文本', appId: 'writer' },
  { title: '文件', description: '浏览文件夹、预览内容并打开应用。', terms: '文件 files 文件夹 目录 预览', appId: 'files' },
  { title: '日历', description: '查看月份与每日日程。', terms: '日历 calendar 日期 日程 月份', appId: 'calendar' },
  { title: '设置', description: '调整主题、强调色与系统偏好。', terms: '设置 settings 主题 颜色 外观 声音', appId: 'settings' },
]

function resolveInternalEntry(rawValue: string): BrowserEntry | null {
  const value = rawValue.trim()
  if (!value) return HOME_ENTRY
  if (INTERNAL_PAGES[value]) return INTERNAL_PAGES[value]
  if (value.startsWith('aster://')) {
    return { url: value, title: '找不到该页面', kind: 'error' }
  }
  if (normalizeExternalUrl(value)) return null
  const query = value.replace(/^\?/, '')
  return {
    url: `aster://search?q=${encodeURIComponent(query)}`,
    title: `搜索：${query}`,
    kind: 'search',
  }
}

export function BrowserApp({ notify, openApp, settings }: AppRuntimeProps) {
  const [history, setHistory] = useState<BrowserEntry[]>([HOME_ENTRY])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [address, setAddress] = useState(HOME_ENTRY.url)
  const [loading, setLoading] = useState(false)
  const addressRef = useRef<HTMLInputElement>(null)
  const refreshTimer = useRef<number | null>(null)
  const current = history[historyIndex] ?? HOME_ENTRY

  const searchQuery = useMemo(() => {
    if (current.kind !== 'search') return ''
    try {
      return new URL(current.url).searchParams.get('q') ?? ''
    } catch {
      return current.url.split('q=')[1] ? decodeURIComponent(current.url.split('q=')[1]) : ''
    }
  }, [current])

  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase('zh-CN')
    if (!normalized) return []
    return SEARCH_ITEMS.filter((item) =>
      `${item.title} ${item.description} ${item.terms}`
        .toLocaleLowerCase('zh-CN')
        .includes(normalized),
    )
  }, [searchQuery])

  useEffect(() => {
    setAddress(current.url)
  }, [current.url])

  useEffect(() => {
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current)
    }
  }, [])

  function showLoading() {
    setLoading(true)
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current)
    refreshTimer.current = window.setTimeout(() => setLoading(false), 420)
  }

  function navigateInternal(entryOrUrl: BrowserEntry | string) {
    const entry = typeof entryOrUrl === 'string' ? resolveInternalEntry(entryOrUrl) : entryOrUrl
    if (!entry) return
    setHistory((items) => [...items.slice(0, historyIndex + 1), entry])
    setHistoryIndex((index) => index + 1)
    showLoading()
  }

  function openExternal(url: string) {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
    notify('已打开外部链接', '页面已在新标签中打开。')
  }

  function submitAddress(event: React.FormEvent) {
    event.preventDefault()
    const externalUrl = normalizeExternalUrl(address)
    if (externalUrl) {
      openExternal(externalUrl)
      return
    }
    const entry = resolveInternalEntry(address)
    if (entry) navigateInternal(entry)
  }

  function moveHistory(delta: number) {
    const nextIndex = historyIndex + delta
    if (nextIndex < 0 || nextIndex >= history.length) return
    setHistoryIndex(nextIndex)
    showLoading()
  }

  function handleAppKeyDown(event: React.KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      addressRef.current?.focus()
      addressRef.current?.select()
    }
  }

  return (
    <section
      className={`os-app os-app--${settings.theme} browser-app`}
      style={appAccentStyle(settings)}
      onKeyDown={handleAppKeyDown}
      aria-label="Aster 浏览器"
    >
      <header className="app-toolbar browser-toolbar">
        <div className="app-toolbar__group browser-navigation" aria-label="页面导航">
          <IconButton label="后退" onClick={() => moveHistory(-1)} disabled={historyIndex === 0}>
            <ArrowLeft size={17} />
          </IconButton>
          <IconButton
            label="前进"
            onClick={() => moveHistory(1)}
            disabled={historyIndex === history.length - 1}
          >
            <ArrowRight size={17} />
          </IconButton>
          <IconButton label="刷新" onClick={showLoading}>
            <RefreshCw size={16} className={loading ? 'is-spinning' : ''} />
          </IconButton>
          <IconButton label="起始页" onClick={() => navigateInternal(HOME_ENTRY)}>
            <Home size={16} />
          </IconButton>
        </div>
        <form className="browser-address" onSubmit={submitAddress}>
          <LockKeyhole size={14} aria-hidden="true" />
          <input
            ref={addressRef}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            aria-label="地址或搜索"
            spellCheck={false}
          />
          <button type="submit" className="browser-address__go" aria-label="前往">
            <ArrowRight size={15} />
          </button>
        </form>
      </header>

      <div className="browser-progress" aria-hidden="true">
        <span className={loading ? 'is-loading' : ''} />
      </div>

      <main className="browser-page" aria-busy={loading}>
        {current.kind === 'start' && (
          <div className="browser-start app-scroll-area">
            <div className="browser-start__intro">
              <span className="browser-mark" aria-hidden="true">
                <Compass size={26} />
              </span>
              <div>
                <h1>从这里开始</h1>
                <p>浏览 Aster 系统页面，或输入关键词和网址。</p>
              </div>
            </div>
            <form className="browser-search" onSubmit={submitAddress}>
              <Search size={18} aria-hidden="true" />
              <input
                value={address === HOME_ENTRY.url ? '' : address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="搜索系统内容或输入网址"
                aria-label="搜索系统内容或输入网址"
              />
            </form>
            <nav className="browser-quick-links" aria-label="快速访问">
              <button type="button" onClick={() => navigateInternal('aster://guide')}>
                <BookOpen size={20} />
                <span><strong>系统指南</strong><small>了解快捷键与基本操作</small></span>
                <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => navigateInternal('aster://focus')}>
                <Sparkles size={20} />
                <span><strong>今日专注</strong><small>开始一次无干扰的工作</small></span>
                <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => navigateInternal('aster://library')}>
                <Compass size={20} />
                <span><strong>精选资源</strong><small>访问可信的开发与设计资料</small></span>
                <ArrowRight size={16} />
              </button>
            </nav>
          </div>
        )}

        {current.kind === 'guide' && (
          <article className="browser-article app-scroll-area">
            <div className="browser-article__heading">
              <BookOpen size={28} />
              <div><h1>系统使用指南</h1><p>熟悉 Aster 的工作方式。</p></div>
            </div>
            <section>
              <h2>窗口与应用</h2>
              <p>从桌面图标或 Dock 打开应用。拖动标题栏移动窗口，使用右上角控件最小化、最大化或关闭。</p>
            </section>
            <section>
              <h2>浏览器</h2>
              <p>在地址栏输入网址会于新标签中打开；输入关键词则搜索 Aster 内容。按 Ctrl + L 可快速聚焦地址栏。</p>
            </section>
            <button className="app-text-button" type="button" onClick={() => navigateInternal('aster://library')}>
              继续浏览精选资源 <ArrowRight size={15} />
            </button>
          </article>
        )}

        {current.kind === 'focus' && (
          <div className="browser-focus app-scroll-area">
            <div className="browser-focus__time">
              <span>专注时段</span>
              <strong>25:00</strong>
              <p>只保留当前任务，给思考一段完整时间。</p>
            </div>
            <div className="browser-focus__list">
              <h2>开始前</h2>
              <label><input type="checkbox" /> 关闭不必要的页面</label>
              <label><input type="checkbox" /> 在记事本写下唯一目标</label>
              <label><input type="checkbox" /> 将通知调整为静音</label>
            </div>
          </div>
        )}

        {current.kind === 'library' && (
          <article className="browser-article app-scroll-area">
            <div className="browser-article__heading">
              <Compass size={28} />
              <div><h1>精选资源</h1><p>外部链接始终在新标签中打开。</p></div>
            </div>
            <div className="browser-resource-list">
              <a href="https://developer.mozilla.org/zh-CN/" target="_blank" rel="noreferrer noopener">
                <span><strong>MDN Web Docs</strong><small>Web 开发技术参考</small></span><ExternalLink size={16} />
              </a>
              <a href="https://react.dev/" target="_blank" rel="noreferrer noopener">
                <span><strong>React</strong><small>现代界面开发文档</small></span><ExternalLink size={16} />
              </a>
              <a href="https://www.w3.org/WAI/" target="_blank" rel="noreferrer noopener">
                <span><strong>W3C 无障碍指南</strong><small>让产品被更多人使用</small></span><ExternalLink size={16} />
              </a>
            </div>
          </article>
        )}

        {current.kind === 'search' && (
          <div className="browser-search-results app-scroll-area">
            <div className="browser-search-results__heading">
              <Search size={24} />
              <div><h1>搜索“{searchQuery}”</h1><p>找到 {searchResults.length} 个系统内结果</p></div>
            </div>
            {searchResults.map((result) => (
              <button
                key={result.title}
                type="button"
                onClick={() => {
                  if (result.appId) {
                    openApp(result.appId)
                    notify('浏览器搜索', `正在打开${result.title}。`)
                  } else if (result.url) {
                    navigateInternal(result.url)
                  }
                }}
              >
                <strong>{result.title}</strong><span>{result.description}</span>
              </button>
            ))}
            {searchResults.length === 0 && (
              <div className="browser-search-results__empty">
                <Compass size={28} />
                <strong>没有找到匹配内容</strong>
                <span>尝试搜索“终端”“文档”或“设置”。</span>
              </div>
            )}
          </div>
        )}

        {current.kind === 'error' && (
          <div className="app-empty-state browser-error" role="alert">
            <Compass size={34} />
            <h1>这个地址还没有内容</h1>
            <p>检查地址是否正确，或返回起始页继续浏览。</p>
            <button className="app-primary-button" type="button" onClick={() => navigateInternal(HOME_ENTRY)}>
              <Home size={16} /> 返回起始页
            </button>
          </div>
        )}
      </main>
      <footer className="app-statusbar">
        <span>{loading ? '正在载入…' : current.title}</span>
        <span className="app-statusbar__secure"><LockKeyhole size={12} /> Aster 安全页面</span>
      </footer>
    </section>
  )
}

