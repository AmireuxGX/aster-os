import { Check, Dock, Moon, Palette, Settings2, Sun, Volume2, VolumeX } from 'lucide-react'
import type { AppRuntimeProps, ThemeMode } from '../types'
import { appAccentStyle } from './shared'

const accentOptions = [
  { name: '蓝莎', value: '#3f7df0' },
  { name: '海松', value: '#138a7e' },
  { name: '珊瑚', value: '#d45f4a' },
  { name: '鸢尾', value: '#7557c7' },
  { name: '琳珀', value: '#b06b18' },
  { name: '花青', value: '#39738f' },
]

export function SettingsApp({ notify, settings, updateSettings }: AppRuntimeProps) {
  function setTheme(theme: ThemeMode) {
    updateSettings({ theme })
    notify('外观已更新', `已切换为${theme === 'dark' ? '深色' : '浅色'}主题。`)
  }

  function setAccent(accent: string, name: string) {
    updateSettings({ accent })
    notify('强调色已更新', `系统现在使用“${name}”。`)
  }

  return (
    <section
      className={`os-app os-app--${settings.theme} settings-app`}
      style={appAccentStyle(settings)}
      aria-label="设置"
    >
      <aside className="settings-sidebar">
        <div className="settings-sidebar__title"><Settings2 size={20} /><h1>设置</h1></div>
        <nav aria-label="设置分类">
          <a href="#appearance" className="is-active"><Palette size={16} /> 外观</a>
          <a href="#feedback"><Volume2 size={16} /> 声音与反馈</a>
          <a href="#dock"><Dock size={16} /> Dock</a>
        </nav>
        <div className="settings-sidebar__version">
          <span>Aster OS</span>
          <small>版本 1.0 · 本地演示</small>
        </div>
      </aside>

      <main className="settings-content app-scroll-area">
        <header className="settings-content__heading">
          <h1>个性化你的桌面</h1>
          <p>更改会立即应用，并在重新打开系统后保留。</p>
        </header>

        <section className="settings-group" id="appearance">
          <div className="settings-group__heading">
            <Palette size={18} />
            <div><h2>外观</h2><p>设置界面的明暗和主要交互色。</p></div>
          </div>
          <div className="settings-row settings-row--stacked">
            <div><strong>系统主题</strong><span>选择舒适的界面亮度。</span></div>
            <div className="settings-theme-options" role="radiogroup" aria-label="系统主题">
              <button type="button" role="radio" aria-checked={settings.theme === 'light'} className={settings.theme === 'light' ? 'is-selected' : ''} onClick={() => setTheme('light')}>
                <Sun size={19} /><span><strong>浅色</strong><small>明亮、清晰</small></span>{settings.theme === 'light' && <Check size={16} />}
              </button>
              <button type="button" role="radio" aria-checked={settings.theme === 'dark'} className={settings.theme === 'dark' ? 'is-selected' : ''} onClick={() => setTheme('dark')}>
                <Moon size={19} /><span><strong>深色</strong><small>柔和、专注</small></span>{settings.theme === 'dark' && <Check size={16} />}
              </button>
            </div>
          </div>
          <div className="settings-row settings-row--stacked">
            <div><strong>强调色</strong><span>用于选中状态、链接和主要操作。</span></div>
            <div className="settings-swatches" role="radiogroup" aria-label="强调色">
              {accentOptions.map((option) => {
                const selected = settings.accent.toLowerCase() === option.value.toLowerCase()
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    key={option.value}
                    onClick={() => setAccent(option.value, option.name)}
                    title={option.name}
                    aria-label={option.name}
                    style={{ '--swatch-color': option.value } as React.CSSProperties}
                    className={selected ? 'is-selected' : ''}
                  >
                    {selected && <Check size={16} />}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="settings-group" id="feedback">
          <div className="settings-group__heading">
            {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <div><h2>声音与反馈</h2><p>控制系统操作的听觉反馈。</p></div>
          </div>
          <label className="settings-row settings-toggle-row">
            <span><strong>系统提示音</strong><small>在打开应用和完成操作时播放轻微提示。</small></span>
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(event) => {
                const sound = event.target.checked
                updateSettings({ sound })
                notify('系统提示音', sound ? '提示音已开启。' : '提示音已静音。')
              }}
            />
          </label>
        </section>

        <section className="settings-group" id="dock">
          <div className="settings-group__heading">
            <Dock size={18} />
            <div><h2>Dock</h2><p>调整底部应用栏的密度。</p></div>
          </div>
          <label className="settings-row settings-toggle-row">
            <span><strong>紧凑 Dock</strong><small>减小图标和间距，为窗口留出更多空间。</small></span>
            <input
              type="checkbox"
              checked={settings.compactDock}
              onChange={(event) => {
                const compactDock = event.target.checked
                updateSettings({ compactDock })
                notify('Dock 密度', compactDock ? '已切换为紧凑 Dock。' : '已恢复标准 Dock。')
              }}
            />
          </label>
          <div className={`settings-dock-preview${settings.compactDock ? ' is-compact' : ''}`} aria-label="Dock 密度预览">
            {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
          </div>
        </section>
      </main>
    </section>
  )
}

