import { useEffect, useRef, useState } from 'react'
import { Circle, SendHorizontal, SquareTerminal } from 'lucide-react'
import type { AppId, AppRuntimeProps } from '../types'
import { appAccentStyle, createId } from './shared'

type LineKind = 'command' | 'output' | 'error' | 'success'

interface TerminalLine {
  id: string
  kind: LineKind
  text: string
}

const appAliases: Record<string, AppId> = {
  browser: 'browser',
  '浏览器': 'browser',
  notes: 'notes',
  note: 'notes',
  '记事本': 'notes',
  terminal: 'terminal',
  '终端': 'terminal',
  calculator: 'calculator',
  calc: 'calculator',
  '计算器': 'calculator',
  writer: 'writer',
  document: 'writer',
  '文档': 'writer',
  files: 'files',
  '文件': 'files',
  calendar: 'calendar',
  '日历': 'calendar',
  settings: 'settings',
  '设置': 'settings',
}

const virtualFiles: Record<string, string> = {
  'welcome.txt': 'Aster OS\n一个专注、流畅、尊重你节奏的桌面系统。',
  'shortcuts.md': '# 快捷操作\n- help：显示帮助\n- open <app>：打开应用\n- theme <light|dark>：切换主题',
  'system.log': '[ok] desktop ready\n[ok] app registry loaded\n[ok] local storage available',
}

const initialLines: TerminalLine[] = [
  { id: 'terminal-welcome', kind: 'output', text: 'Aster Terminal 1.0\n输入 help 查看可用命令。' },
]

function splitCommand(value: string) {
  return (value.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((part) => part.replace(/^"|"$/g, ''))
}

export function TerminalApp({ openApp, notify, settings, updateSettings }: AppRuntimeProps) {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines)
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  function append(kind: LineKind, text: string) {
    setLines((items) => [...items, { id: createId('line'), kind, text }])
  }

  function runCommand(rawCommand: string) {
    const trimmed = rawCommand.trim()
    if (!trimmed) return
    const [name = '', ...args] = splitCommand(trimmed)
    const normalizedName = name.toLowerCase()

    setCommandHistory((items) => [...items, trimmed])
    setHistoryIndex(-1)

    if (normalizedName === 'clear') {
      setLines([])
      return
    }

    append('command', trimmed)

    switch (normalizedName) {
      case 'help':
        append('output', [
          '可用命令',
          'help                 显示命令帮助',
          'clear                清空当前终端',
          'date                 显示当前日期和时间',
          'whoami               显示当前用户',
          'ls                   列出当前目录',
          'cat <文件>           读取示例文件',
          'open <应用>          打开桌面应用',
          'theme <light|dark>   切换系统主题',
        ].join('\n'))
        break
      case 'date':
        append('output', new Intl.DateTimeFormat('zh-CN', {
          dateStyle: 'full',
          timeStyle: 'medium',
        }).format(new Date()))
        break
      case 'whoami':
        append('output', 'aster-user\n本地用户 · 标准会话')
        break
      case 'ls':
        append('output', 'Applications/  Documents/  welcome.txt  shortcuts.md  system.log')
        break
      case 'cat': {
        const fileName = args.join(' ')
        if (!fileName) {
          append('error', '用法：cat <文件名>')
        } else if (virtualFiles[fileName]) {
          append('output', virtualFiles[fileName])
        } else {
          append('error', `cat: 找不到“${fileName}”。输入 ls 查看可用文件。`)
        }
        break
      }
      case 'open': {
        const appName = args.join(' ').toLowerCase()
        const appId = appAliases[appName]
        if (!appName) {
          append('error', '用法：open <应用名>')
        } else if (!appId) {
          append('error', `open: 没有名为“${args.join(' ')}”的应用。`)
        } else {
          openApp(appId)
          append('success', `已请求打开 ${args.join(' ')}。`)
          notify('终端', `正在打开 ${args.join(' ')}。`)
        }
        break
      }
      case 'theme': {
        const nextTheme = args[0]?.toLowerCase()
        if (!nextTheme) {
          append('output', `当前主题：${settings.theme === 'dark' ? 'dark（深色）' : 'light（浅色）'}`)
        } else if (nextTheme === 'light' || nextTheme === '浅色') {
          updateSettings({ theme: 'light' })
          append('success', '已切换为浅色主题。')
        } else if (nextTheme === 'dark' || nextTheme === '深色') {
          updateSettings({ theme: 'dark' })
          append('success', '已切换为深色主题。')
        } else {
          append('error', 'theme: 只支持 light 或 dark。')
        }
        break
      }
      default:
        append('error', `${name}: 未找到命令。输入 help 查看可用命令。`)
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const nextCommand = command
    setCommand('')
    runCommand(nextCommand)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = Math.min(commandHistory.length - 1, historyIndex + 1)
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex)
        setCommand(commandHistory[commandHistory.length - 1 - nextIndex] ?? '')
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      setCommand(nextIndex >= 0 ? commandHistory[commandHistory.length - 1 - nextIndex] ?? '' : '')
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      setLines([])
    }
  }

  return (
    <section
      className={`os-app terminal-app terminal-app--${settings.theme}`}
      style={appAccentStyle(settings)}
      aria-label="终端"
      onClick={() => inputRef.current?.focus()}
    >
      <header className="terminal-header">
        <SquareTerminal size={16} />
        <span>aster-user@desktop: ~</span>
        <span className="terminal-header__session"><Circle size={7} fill="currentColor" /> 本地会话</span>
      </header>
      <div className="terminal-viewport app-scroll-area" ref={viewportRef} aria-live="polite">
        {lines.length === 0 && (
          <div className="terminal-empty">终端已清空。输入 help 查看命令。</div>
        )}
        {lines.map((line) => (
          <div className={`terminal-line terminal-line--${line.kind}`} key={line.id}>
            {line.kind === 'command' && <span className="terminal-prompt" aria-hidden="true">aster@desktop ~ %</span>}
            <pre>{line.text}</pre>
          </div>
        ))}
        <form className="terminal-input-row" onSubmit={submit}>
          <label htmlFor="terminal-command">aster@desktop ~ %</label>
          <input
            id="terminal-command"
            ref={inputRef}
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-label="终端命令"
          />
          <button type="submit" aria-label="执行命令" title="执行命令">
            <SendHorizontal size={15} />
          </button>
        </form>
      </div>
    </section>
  )
}

