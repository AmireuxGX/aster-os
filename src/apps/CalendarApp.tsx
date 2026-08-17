import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react'
import type { AppRuntimeProps } from '../types'
import { appAccentStyle, IconButton } from './shared'

interface CalendarCell {
  date: Date
  inCurrentMonth: boolean
}

interface CalendarEvent {
  title: string
  time: string
  place?: string
  tone: 'accent' | 'green' | 'amber'
}

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sameDate(left: Date, right: Date) {
  return dateKey(left) === dateKey(right)
}

function buildMonthCells(cursor: Date): CalendarCell[] {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const mondayOffset = (first.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - mondayOffset + 1)
    return { date, inCurrentMonth: date.getMonth() === month }
  })
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function CalendarApp({ settings }: AppRuntimeProps) {
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)
  const cells = useMemo(() => buildMonthCells(cursor), [cursor])

  const events = useMemo<Record<string, CalendarEvent[]>>(() => ({
    [dateKey(today)]: [
      { title: '整理今日任务', time: '09:30', place: '工作台', tone: 'accent' },
      { title: '专注时段', time: '14:00', tone: 'green' },
    ],
    [dateKey(addDays(today, 2))]: [
      { title: '项目回顾', time: '16:30', place: '在线会议', tone: 'amber' },
    ],
    [dateKey(addDays(today, 5))]: [
      { title: '周计划', time: '10:00', tone: 'accent' },
    ],
  }), [today])

  const selectedEvents = events[dateKey(selectedDate)] ?? []

  function moveMonth(delta: number) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  function goToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  function selectDate(date: Date) {
    setSelectedDate(date)
    if (date.getMonth() !== cursor.getMonth() || date.getFullYear() !== cursor.getFullYear()) {
      setCursor(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }

  return (
    <section
      className={`os-app os-app--${settings.theme} calendar-app`}
      style={appAccentStyle(settings)}
      aria-label="日历"
    >
      <header className="app-toolbar calendar-toolbar">
        <div className="calendar-toolbar__month">
          <CalendarDays size={20} />
          <h1>{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(cursor)}</h1>
        </div>
        <span className="app-toolbar__spacer" />
        <button className="app-text-button app-text-button--compact" type="button" onClick={goToday}>今天</button>
        <div className="app-segmented-control" aria-label="切换月份">
          <IconButton label="上个月" onClick={() => moveMonth(-1)}><ChevronLeft size={17} /></IconButton>
          <IconButton label="下个月" onClick={() => moveMonth(1)}><ChevronRight size={17} /></IconButton>
        </div>
      </header>

      <div className="calendar-layout">
        <main className="calendar-grid-wrap">
          <div className="calendar-weekdays" aria-hidden="true">
            {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="calendar-grid" role="grid" aria-label={new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(cursor)}>
            {cells.map((cell) => {
              const dayEvents = events[dateKey(cell.date)] ?? []
              const isToday = sameDate(cell.date, today)
              const isSelected = sameDate(cell.date, selectedDate)
              return (
                <button
                  type="button"
                  role="gridcell"
                  key={dateKey(cell.date)}
                  className={`calendar-day${cell.inCurrentMonth ? '' : ' is-outside'}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                  onClick={() => selectDate(cell.date)}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(cell.date)}
                >
                  <span>{cell.date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <span className="calendar-day__events" aria-label={`${dayEvents.length} 个日程`}>
                      {dayEvents.slice(0, 3).map((event, index) => (
                        <i className={`is-${event.tone}`} key={`${event.title}-${index}`} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </main>

        <aside className="calendar-agenda">
          <header>
            <span>{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(selectedDate)}</span>
            <strong>{new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(selectedDate)}</strong>
          </header>
          <div className="calendar-agenda__events app-scroll-area">
            {selectedEvents.map((event, index) => (
              <article className={`calendar-event calendar-event--${event.tone}`} key={`${event.title}-${index}`}>
                <i aria-hidden="true" />
                <div>
                  <h2>{event.title}</h2>
                  <p><Clock3 size={13} /> {event.time}</p>
                  {event.place && <p><MapPin size={13} /> {event.place}</p>}
                </div>
              </article>
            ))}
            {selectedEvents.length === 0 && (
              <div className="app-empty-state app-empty-state--compact">
                <CalendarDays size={30} />
                <h2>当天没有日程</h2>
                <p>这是一段可自由安排的时间。</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

