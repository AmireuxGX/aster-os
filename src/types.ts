import type { ComponentType } from 'react'

export type AppId =
  | 'browser'
  | 'notes'
  | 'terminal'
  | 'calculator'
  | 'writer'
  | 'files'
  | 'calendar'
  | 'settings'

export type ThemeMode = 'dark' | 'light'

export interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowInstance {
  id: string
  appId: AppId
  title: string
  bounds: WindowBounds
  restoreBounds?: WindowBounds
  minimized: boolean
  maximized: boolean
  zIndex: number
}

export interface SystemSettings {
  theme: ThemeMode
  accent: string
  sound: boolean
  compactDock: boolean
}

export interface AppRuntimeProps {
  openApp: (appId: AppId) => void
  notify: (title: string, message: string) => void
  settings: SystemSettings
  updateSettings: (patch: Partial<SystemSettings>) => void
}

export interface AppDefinition {
  id: AppId
  title: string
  subtitle: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  accent: string
  defaultSize: { width: number; height: number }
  minSize: { width: number; height: number }
  component: ComponentType<AppRuntimeProps>
}

export interface ToastMessage {
  id: string
  title: string
  message: string
}

