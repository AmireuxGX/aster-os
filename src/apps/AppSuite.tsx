import {
  Calculator,
  CalendarDays,
  FilePenLine,
  Folder,
  Globe2,
  NotebookPen,
  Settings2,
  SquareTerminal,
} from 'lucide-react'
import type { AppDefinition } from '../types'
import { BrowserApp } from './BrowserApp'
import { CalculatorApp } from './CalculatorApp'
import { CalendarApp } from './CalendarApp'
import { FilesApp } from './FilesApp'
import { NotesApp } from './NotesApp'
import { SettingsApp } from './SettingsApp'
import { TerminalApp } from './TerminalApp'
import { WriterApp } from './WriterApp'

export const appDefinitions: AppDefinition[] = [
  {
    id: 'browser',
    title: '浏览器',
    subtitle: '访问系统页面与外部网站',
    icon: Globe2,
    accent: '#3f7df0',
    defaultSize: { width: 940, height: 650 },
    minSize: { width: 560, height: 420 },
    component: BrowserApp,
  },
  {
    id: 'notes',
    title: '记事本',
    subtitle: '快速记录与自动保存',
    icon: NotebookPen,
    accent: '#d0a323',
    defaultSize: { width: 820, height: 590 },
    minSize: { width: 520, height: 380 },
    component: NotesApp,
  },
  {
    id: 'terminal',
    title: '终端',
    subtitle: '系统命令与快速操作',
    icon: SquareTerminal,
    accent: '#43b581',
    defaultSize: { width: 760, height: 500 },
    minSize: { width: 500, height: 340 },
    component: TerminalApp,
  },
  {
    id: 'calculator',
    title: '计算器',
    subtitle: '安全的实时四则运算',
    icon: Calculator,
    accent: '#d45f4a',
    defaultSize: { width: 680, height: 560 },
    minSize: { width: 430, height: 460 },
    component: CalculatorApp,
  },
  {
    id: 'writer',
    title: '文档',
    subtitle: '专注写作与富文本排版',
    icon: FilePenLine,
    accent: '#39738f',
    defaultSize: { width: 900, height: 670 },
    minSize: { width: 580, height: 430 },
    component: WriterApp,
  },
  {
    id: 'files',
    title: '文件',
    subtitle: '浏览文件夹与打开内容',
    icon: Folder,
    accent: '#4d82bf',
    defaultSize: { width: 940, height: 610 },
    minSize: { width: 560, height: 390 },
    component: FilesApp,
  },
  {
    id: 'calendar',
    title: '日历',
    subtitle: '月视图与每日日程',
    icon: CalendarDays,
    accent: '#bf4d5c',
    defaultSize: { width: 860, height: 600 },
    minSize: { width: 540, height: 400 },
    component: CalendarApp,
  },
  {
    id: 'settings',
    title: '设置',
    subtitle: '主题、颜色与系统偏好',
    icon: Settings2,
    accent: '#7557c7',
    defaultSize: { width: 820, height: 600 },
    minSize: { width: 540, height: 420 },
    component: SettingsApp,
  },
]

