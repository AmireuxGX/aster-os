import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BatteryMedium,
  Bell,
  Bluetooth,
  Check,
  ChevronRight,
  CloudSun,
  Focus,
  Grid3X3,
  Lock,
  Monitor,
  Moon,
  Pause,
  Play,
  Power,
  RotateCcw,
  Search,
  SlidersHorizontal,
  SunMedium,
  Volume2,
  Wifi,
  X,
} from 'lucide-react'
import { appDefinitions } from './apps'
import { BootScreen, WindowFrame } from './shell/WindowFrame'
import type {
  AppDefinition,
  AppId,
  SystemSettings,
  ToastMessage,
  WindowBounds,
  WindowInstance,
} from './types'

const SETTINGS_KEY = 'aster-os:settings:v1'

const defaultSettings: SystemSettings = {
  theme: 'dark',
  accent: '#4f8cff',
  sound: true,
  compactDock: false,
}

const desktopApps: AppId[] = ['browser', 'files', 'writer', 'notes', 'terminal', 'calculator']
const dockApps: AppId[] = ['files', 'browser', 'notes', 'writer', 'terminal', 'calculator']

function readSettings(): SystemSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function getInitialBounds(app: AppDefinition, order: number): WindowBounds {
  const width = Math.min(app.defaultSize.width, Math.max(360, window.innerWidth - 48))
  const height = Math.min(app.defaultSize.height, Math.max(420, window.innerHeight - 112))
  const offset = (order % 6) * 26

  return {
    x: Math.max(12, Math.min(104 + offset, window.innerWidth - width - 24)),
    y: Math.max(44, Math.min(72 + offset, window.innerHeight - height - 84)),
    width,
    height,
  }
}

function Clock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const time = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)

  if (compact) {
    return <time dateTime={now.toISOString()}>{time}</time>
  }

  const date = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(now)

  return (
    <div className="desktop-clock" aria-label={`${date} ${time}`}>
      <time className="desktop-clock__time" dateTime={now.toISOString()}>
        {time}
      </time>
      <span className="desktop-clock__date">{date}</span>
    </div>
  )
}

function App() {
  const [booting, setBooting] = useState(true)
  const [locked, setLocked] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 720)
  const [windows, setWindows] = useState<WindowInstance[]>([])
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [controlOpen, setControlOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [launcherQuery, setLauncherQuery] = useState('')
  const [settings, setSettings] = useState<SystemSettings>(readSettings)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [wifiOn, setWifiOn] = useState(true)
  const [bluetoothOn, setBluetoothOn] = useState(true)
  const [focusOn, setFocusOn] = useState(false)
  const [brightness, setBrightness] = useState(82)
  const [volume, setVolume] = useState(64)
  const [playing, setPlaying] = useState(true)
  const [notificationCount, setNotificationCount] = useState(2)
  const [desktopMenu, setDesktopMenu] = useState<{ x: number; y: number } | null>(null)
  const zRef = useRef(10)
  const unlockButtonRef = useRef<HTMLButtonElement>(null)

  const appMap = useMemo(
    () => new Map(appDefinitions.map((app) => [app.id, app])),
    [],
  )

  const activeWindow = useMemo(
    () => windows.filter((item) => !item.minimized).sort((a, b) => b.zIndex - a.zIndex)[0],
    [windows],
  )

  const notify = useCallback((title: string, message: string) => {
    const toast = { id: uid('toast'), title, message }
    setToasts((items) => [...items.slice(-2), toast])
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== toast.id))
    }, 4200)
  }, [])

  const focusWindow = useCallback((id: string) => {
    zRef.current += 1
    setWindows((items) =>
      items.map((item) =>
        item.id === id ? { ...item, zIndex: zRef.current, minimized: false } : item,
      ),
    )
  }, [])

  const openApp = useCallback(
    (appId: AppId) => {
      const app = appMap.get(appId)
      if (!app) return

      setLauncherOpen(false)
      setControlOpen(false)
      setNotificationsOpen(false)
      setDesktopMenu(null)
      zRef.current += 1

      setWindows((items) => {
        const existing = items.find((item) => item.appId === appId)
        if (existing) {
          return items.map((item) =>
            item.id === existing.id
              ? { ...item, minimized: false, zIndex: zRef.current }
              : item,
          )
        }

        return [
          ...items,
          {
            id: uid(appId),
            appId,
            title: app.title,
            bounds: getInitialBounds(app, items.length),
            minimized: false,
            maximized: false,
            zIndex: zRef.current,
          },
        ]
      })
    },
    [appMap],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((items) => items.filter((item) => item.id !== id))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((items) =>
      items.map((item) => (item.id === id ? { ...item, minimized: true } : item)),
    )
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows((items) =>
      items.map((item) => {
        if (item.id !== id) return item
        if (item.maximized) {
          return {
            ...item,
            maximized: false,
            bounds: item.restoreBounds ?? item.bounds,
            restoreBounds: undefined,
          }
        }
        return {
          ...item,
          maximized: true,
          restoreBounds: item.bounds,
        }
      }),
    )
  }, [])

  const updateBounds = useCallback((id: string, bounds: WindowBounds) => {
    setWindows((items) =>
      items.map((item) =>
        item.id === id ? { ...item, bounds, maximized: false } : item,
      ),
    )
  }, [])

  const updateSettings = useCallback((patch: Partial<SystemSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const query = window.matchMedia(
      '(max-width: 720px), (max-height: 520px) and (max-width: 900px)',
    )
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (locked) {
      setLauncherOpen(false)
      setControlOpen(false)
      setNotificationsOpen(false)
      setDesktopMenu(null)
      window.requestAnimationFrame(() => unlockButtonRef.current?.focus())
    }
  }, [locked])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (locked) return
      const target = event.target as HTMLElement | null
      const editing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (event.key === 'Escape') {
        setLauncherOpen(false)
        setControlOpen(false)
        setNotificationsOpen(false)
        setDesktopMenu(null)
      }

      if (event.ctrlKey && event.code === 'Space' && !editing) {
        event.preventDefault()
        setLauncherOpen((open) => !open)
      }

      if (event.altKey && event.key === 'F4' && activeWindow && !editing) {
        event.preventDefault()
        closeWindow(activeWindow.id)
      }

      if (event.altKey && event.key === 'Tab' && windows.length > 0 && !editing) {
        event.preventDefault()
        const ordered = [...windows].sort((a, b) => b.zIndex - a.zIndex)
        const next = ordered.find((item) => item.id !== activeWindow?.id) ?? ordered[0]
        focusWindow(next.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeWindow, closeWindow, focusWindow, locked, windows])

  const handleDockApp = (appId: AppId) => {
    const existing = windows.find((item) => item.appId === appId)
    if (!existing) {
      openApp(appId)
      return
    }
    if (activeWindow?.id === existing.id && !existing.minimized) {
      minimizeWindow(existing.id)
      return
    }
    focusWindow(existing.id)
  }

  const filteredApps = appDefinitions.filter((app) =>
    `${app.title}${app.subtitle}${app.id}`.toLowerCase().includes(launcherQuery.toLowerCase()),
  )

  const closePanels = () => {
    setLauncherOpen(false)
    setControlOpen(false)
    setNotificationsOpen(false)
    setDesktopMenu(null)
  }

  if (booting) {
    return <BootScreen onComplete={() => setBooting(false)} />
  }

  return (
    <main
      className={`aster-os theme-${settings.theme}`}
      style={{
        '--accent': settings.accent,
        '--screen-dim': Math.max(0, (100 - brightness) / 180),
      } as React.CSSProperties}
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) closePanels()
      }}
      onContextMenu={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('.window-frame, .topbar, .dock, .system-panel')) return
        event.preventDefault()
        setDesktopMenu({ x: event.clientX, y: event.clientY })
      }}
    >
      <div className="wallpaper" aria-hidden="true" />
      <div className="wallpaper-shade" aria-hidden="true" />

      <header className="topbar" inert={locked}>
        <button
          className={`topbar-brand ${launcherOpen ? 'is-active' : ''}`}
          onClick={() => {
            setLauncherOpen((open) => !open)
            setControlOpen(false)
            setNotificationsOpen(false)
          }}
          aria-label="打开应用启动器"
          aria-expanded={launcherOpen}
        >
          <span className="aster-mark aster-mark--small" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>ASTER</strong>
        </button>
        <div className="topbar-active" aria-live="polite">
          {activeWindow ? activeWindow.title : '桌面'}
        </div>
        <div className="topbar-status">
          <button
            className={`status-button ${notificationsOpen ? 'is-active' : ''}`}
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setControlOpen(false)
              setLauncherOpen(false)
            }}
            aria-label="通知"
            aria-expanded={notificationsOpen}
          >
            <Bell size={16} />
            {notificationCount > 0 && <span className="status-dot" />}
          </button>
          <button
            className={`status-button status-cluster ${controlOpen ? 'is-active' : ''}`}
            onClick={() => {
              setControlOpen((open) => !open)
              setLauncherOpen(false)
              setNotificationsOpen(false)
            }}
            aria-label="打开控制中心"
            aria-expanded={controlOpen}
          >
            <Wifi size={15} />
            <Volume2 size={15} />
            <BatteryMedium size={17} />
          </button>
          <button
            className="status-button status-time"
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setControlOpen(false)
              setLauncherOpen(false)
            }}
            aria-label="打开日期与通知"
          >
            <Clock compact />
          </button>
        </div>
      </header>

      <section className="desktop" aria-label="Aster OS 桌面" inert={locked}>
        <nav className="desktop-shortcuts" aria-label="桌面快捷方式">
          {desktopApps.map((id) => {
            const app = appMap.get(id)!
            const Icon = app.icon
            return (
              <button
                className="desktop-shortcut"
                key={id}
                onClick={() => openApp(id)}
                aria-label={`打开${app.title}`}
              >
                <span className="app-icon app-icon--desktop" style={{ '--app-color': app.accent } as React.CSSProperties}>
                  <Icon size={27} strokeWidth={1.8} />
                </span>
                <span>{app.title}</span>
              </button>
            )
          })}
        </nav>

        <div className="contact-sheet" aria-hidden="true">
          <div className="contact-sheet__edge contact-sheet__edge--top" />
          <div className="contact-sheet__frames">
            <i className="contact-sheet__frame contact-sheet__frame--one" />
            <i className="contact-sheet__frame contact-sheet__frame--two" />
            <i className="contact-sheet__frame contact-sheet__frame--three" />
            <i className="contact-sheet__frame contact-sheet__frame--four" />
          </div>
          <div className="contact-sheet__edge contact-sheet__edge--bottom" />
          <span>ASTER 400 · LIGHT TABLE · FRAME 06</span>
        </div>

        <aside className="desktop-glance" aria-label="桌面概览">
          <Clock />
          <button className="glance-weather" onClick={() => openApp('calendar')}>
            <CloudSun size={22} />
            <span>
              <strong>24°</strong>
              <small>舒适 · 微风</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <div className="glance-agenda">
            <span className="agenda-rail" />
            <div>
              <small>今天 · 14:30</small>
              <strong>整理 Aster 设计稿</strong>
              <span>专注模式将在开始时自动开启</span>
            </div>
          </div>
        </aside>

        <section className="window-layer" aria-label="打开的窗口">
          {windows.map((windowItem) => {
            const app = appMap.get(windowItem.appId)
            if (!app) return null
            const AppComponent = app.component

            return (
              <WindowFrame
                key={windowItem.id}
                window={windowItem}
                app={app}
                active={activeWindow?.id === windowItem.id}
                mobile={isMobile}
                onFocus={() => focusWindow(windowItem.id)}
                onClose={() => closeWindow(windowItem.id)}
                onMinimize={() => minimizeWindow(windowItem.id)}
                onToggleMaximize={() => toggleMaximize(windowItem.id)}
                onBoundsChange={(bounds) => updateBounds(windowItem.id, bounds)}
              >
                <AppComponent
                  openApp={openApp}
                  notify={notify}
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </WindowFrame>
            )
          })}
        </section>
      </section>

      <nav className={`dock ${settings.compactDock ? 'dock--compact' : ''}`} aria-label="程序坞" inert={locked}>
        <button
          className={`dock-button dock-launcher ${launcherOpen ? 'is-active' : ''}`}
          onClick={() => {
            setLauncherOpen((open) => !open)
            setControlOpen(false)
            setNotificationsOpen(false)
          }}
          aria-label="应用启动器"
        >
          <Grid3X3 size={21} />
        </button>
        <span className="dock-separator" />
        {dockApps.map((id) => {
          const app = appMap.get(id)!
          const Icon = app.icon
          const running = windows.some((item) => item.appId === id)
          const active = activeWindow?.appId === id
          return (
            <button
              className={`dock-button ${running ? 'is-running' : ''} ${active ? 'is-active' : ''}`}
              key={id}
              onClick={() => handleDockApp(id)}
              aria-label={app.title}
              title={app.title}
            >
              <span className="app-icon app-icon--dock" style={{ '--app-color': app.accent } as React.CSSProperties}>
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <span className="dock-running-dot" />
            </button>
          )
        })}
        <span className="dock-separator dock-separator--end" />
        <button
          className="dock-button dock-button--utility"
          onClick={() => setNotificationsOpen((open) => !open)}
          aria-label="通知中心"
        >
          <Bell size={19} />
          {notificationCount > 0 && <span className="dock-notification-badge">{notificationCount}</span>}
        </button>
      </nav>

      {launcherOpen && (
        <section className="system-panel launcher-panel" aria-label="应用启动器">
          <div className="launcher-head">
            <div>
              <span className="launcher-greeting">晚上好</span>
              <strong>准备好继续创作了吗？</strong>
            </div>
            <button
              className="avatar-button"
              aria-label="用户账户"
              onClick={() => notify('本地访客', 'Aster ID 正在以本地模式运行。')}
            >
              林
            </button>
          </div>
          <label className="launcher-search">
            <Search size={18} />
            <input
              autoFocus
              value={launcherQuery}
              onChange={(event) => setLauncherQuery(event.target.value)}
              placeholder="搜索应用和文档"
              aria-label="搜索应用和文档"
            />
            <kbd>Ctrl Space</kbd>
          </label>
          <div className="launcher-section-head">
            <strong>{launcherQuery ? '搜索结果' : '所有应用'}</strong>
            <span>{filteredApps.length} 个</span>
          </div>
          <div className="launcher-grid">
            {filteredApps.map((app) => {
              const Icon = app.icon
              return (
                <button key={app.id} onClick={() => openApp(app.id)} className="launcher-app">
                  <span className="app-icon app-icon--launcher" style={{ '--app-color': app.accent } as React.CSSProperties}>
                    <Icon size={24} strokeWidth={1.9} />
                  </span>
                  <span>
                    <strong>{app.title}</strong>
                    <small>{app.subtitle}</small>
                  </span>
                </button>
              )
            })}
          </div>
          {!launcherQuery && (
            <div className="launcher-recents">
              <div className="launcher-section-head">
                <strong>继续处理</strong>
                <button onClick={() => openApp('files')}>查看全部</button>
              </div>
              <button className="recent-file" onClick={() => openApp('writer')}>
                <span className="recent-file__mark">W</span>
                <span>
                  <strong>Aster 产品构想</strong>
                  <small>文档 · 8 分钟前</small>
                </span>
                <ChevronRight size={16} />
              </button>
              <button className="recent-file" onClick={() => openApp('notes')}>
                <span className="recent-file__mark recent-file__mark--note">N</span>
                <span>
                  <strong>本周灵感清单</strong>
                  <small>便笺 · 昨天</small>
                </span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <footer className="launcher-footer">
            <span><span className="presence-dot" /> Aster ID 已同步</span>
            <div>
              <button title="锁定" aria-label="锁定" onClick={() => setLocked(true)}><Lock size={17} /></button>
              <button title="重新启动演示" aria-label="重新启动演示" onClick={() => setBooting(true)}><RotateCcw size={17} /></button>
              <button title="重新启动" aria-label="重新启动" onClick={() => { setLauncherOpen(false); setBooting(true) }}><Power size={17} /></button>
            </div>
          </footer>
        </section>
      )}

      {controlOpen && (
        <section className="system-panel control-panel" aria-label="控制中心">
          <div className="control-topline">
            <strong>控制中心</strong>
            <button onClick={() => openApp('settings')} aria-label="打开系统设置"><SlidersHorizontal size={18} /></button>
          </div>
          <div className="toggle-grid">
            <button aria-pressed={wifiOn} className={wifiOn ? 'is-on' : ''} onClick={() => setWifiOn(!wifiOn)}>
              <span><Wifi size={19} /></span>
              <span><strong>无线网络</strong><small>{wifiOn ? 'Aster Studio' : '已关闭'}</small></span>
            </button>
            <button aria-pressed={bluetoothOn} className={bluetoothOn ? 'is-on' : ''} onClick={() => setBluetoothOn(!bluetoothOn)}>
              <span><Bluetooth size={19} /></span>
              <span><strong>蓝牙</strong><small>{bluetoothOn ? '已连接' : '已关闭'}</small></span>
            </button>
            <button aria-pressed={focusOn} className={focusOn ? 'is-on' : ''} onClick={() => setFocusOn(!focusOn)}>
              <span><Focus size={19} /></span>
              <span><strong>专注</strong><small>{focusOn ? '已开启' : '关闭'}</small></span>
            </button>
            <button aria-pressed={settings.theme === 'light'} className={settings.theme === 'light' ? 'is-on' : ''} onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>
              <span>{settings.theme === 'dark' ? <Moon size={19} /> : <SunMedium size={19} />}</span>
              <span><strong>外观</strong><small>{settings.theme === 'dark' ? '深色' : '浅色'}</small></span>
            </button>
          </div>
          <label className="control-slider">
            <SunMedium size={18} />
            <input aria-label="屏幕亮度" type="range" min="20" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
            <span>{brightness}%</span>
          </label>
          <label className="control-slider">
            <Volume2 size={18} />
            <input aria-label="音量" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
            <span>{volume}%</span>
          </label>
          <div className="now-playing">
            <span className="album-mini" aria-hidden="true"><i /><i /><i /></span>
            <span><strong>Low Light</strong><small>Aster Radio · Focus</small></span>
            <button aria-label="播放或暂停" onClick={() => setPlaying((value) => !value)}>
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
        </section>
      )}

      {notificationsOpen && (
        <section className="system-panel notification-panel" aria-label="通知中心">
          <div className="notification-head">
            <div><Clock /><span>{notificationCount > 0 ? `${notificationCount} 条新通知` : '通知已清空'}</span></div>
            <button onClick={() => setNotificationsOpen(false)} aria-label="关闭通知中心"><X size={18} /></button>
          </div>
          {notificationCount > 0 ? (
            <div className="notification-list">
              <article>
                <span className="notification-icon notification-icon--sync"><Check size={17} /></span>
                <div><strong>文件已同步</strong><p>“Aster 产品构想”已安全保存到本地工作区。</p><small>刚刚</small></div>
              </article>
              <article>
                <span className="notification-icon notification-icon--calendar"><Monitor size={17} /></span>
                <div><strong>专注时段即将开始</strong><p>14:30 的设计整理还有 12 分钟。</p><small>3 分钟前</small></div>
              </article>
            </div>
          ) : (
            <div className="notification-empty"><Bell size={22} /><strong>没有新通知</strong><span>稍后再来看看。</span></div>
          )}
          {notificationCount > 0 && (
            <button className="notification-clear" onClick={() => setNotificationCount(0)}>全部标为已读</button>
          )}
        </section>
      )}

      {desktopMenu && (
        <div
          className="desktop-menu"
          style={{ left: Math.min(desktopMenu.x, window.innerWidth - 210), top: Math.min(desktopMenu.y, window.innerHeight - 260) }}
          role="menu"
        >
          <button onClick={() => openApp('notes')}><span>新建便笺</span><kbd>N</kbd></button>
          <button onClick={() => openApp('writer')}><span>新建文档</span><kbd>D</kbd></button>
          <span className="menu-rule" />
          <button onClick={() => notify('桌面已刷新', '所有项目都是最新状态。')}><span>刷新桌面</span><kbd>F5</kbd></button>
          <button onClick={() => openApp('settings')}><span>显示与外观</span><ChevronRight size={15} /></button>
        </div>
      )}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <article className="toast" key={toast.id}>
            <span className="toast-mark"><Check size={16} /></span>
            <span><strong>{toast.title}</strong><small>{toast.message}</small></span>
            <button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="关闭"><X size={15} /></button>
          </article>
        ))}
      </div>

      {locked && (
        <section className="lock-screen" role="dialog" aria-modal="true" aria-label="锁定屏幕">
          <div className="lock-screen__scrim" />
          <div className="lock-screen__content">
            <Clock />
            <span className="lock-screen__avatar">林</span>
            <strong>林屿</strong>
            <button ref={unlockButtonRef} onClick={() => setLocked(false)}>进入桌面</button>
          </div>
        </section>
      )}
    </main>
  )
}

export default App

