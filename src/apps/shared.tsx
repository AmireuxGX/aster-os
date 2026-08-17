import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { SystemSettings } from '../types'

type AccentStyle = CSSProperties & { '--app-accent': string }

export function appAccentStyle(settings: SystemSettings): AccentStyle {
  return { '--app-accent': settings.accent }
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  active?: boolean
}

export function IconButton({
  label,
  children,
  active,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`app-icon-button${active ? ' is-active' : ''}${className ? ` ${className}` : ''}`}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={label}
      {...props}
    >
      {children}
    </button>
  )
}

export function SaveState({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  const copy = {
    idle: '尚未更改',
    saving: '正在保存',
    saved: '已保存',
    error: '保存失败',
  }[state]

  return (
    <span className={`app-save-state app-save-state--${state}`} role={state === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true" className="app-save-state__dot" />
      {copy}
    </span>
  )
}

export function normalizeExternalUrl(value: string) {
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w-]+(?:\.[\w-]+)+(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return null
}

export function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function isEditableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return Boolean(
    element &&
      (element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.isContentEditable),
  )
}

