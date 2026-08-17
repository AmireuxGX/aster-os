import { useEffect, useRef, useState } from 'react'
import { Calculator, Delete, History, Trash2 } from 'lucide-react'
import type { AppRuntimeProps } from '../types'
import { calculateExpression, CalculatorError } from './calculatorEngine'
import { appAccentStyle, createId, IconButton } from './shared'

interface CalculationRecord {
  id: string
  expression: string
  result: string
}

const calculatorButtons = [
  { label: 'AC', value: 'clear', kind: 'utility' },
  { label: '(', value: '(', kind: 'utility' },
  { label: ')', value: ')', kind: 'utility' },
  { label: '÷', value: '/', kind: 'operator' },
  { label: '7', value: '7', kind: 'number' },
  { label: '8', value: '8', kind: 'number' },
  { label: '9', value: '9', kind: 'number' },
  { label: '×', value: '*', kind: 'operator' },
  { label: '4', value: '4', kind: 'number' },
  { label: '5', value: '5', kind: 'number' },
  { label: '6', value: '6', kind: 'number' },
  { label: '−', value: '-', kind: 'operator' },
  { label: '1', value: '1', kind: 'number' },
  { label: '2', value: '2', kind: 'number' },
  { label: '3', value: '3', kind: 'number' },
  { label: '+', value: '+', kind: 'operator' },
  { label: '0', value: '0', kind: 'number span-two' },
  { label: '.', value: '.', kind: 'number' },
  { label: '=', value: 'equals', kind: 'equals' },
] as const

function presentExpression(value: string) {
  return value.replaceAll('*', '×').replaceAll('/', '÷').replaceAll('-', '−')
}

function formatResult(value: number) {
  if (Object.is(value, -0)) return '0'
  const normalized = Number.parseFloat(value.toPrecision(12))
  return normalized.toString()
}

export function CalculatorApp({ settings }: AppRuntimeProps) {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<CalculationRecord[]>([])
  const [justEvaluated, setJustEvaluated] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  function clear() {
    setExpression('')
    setResult('0')
    setError(null)
    setJustEvaluated(false)
  }

  function backspace() {
    setError(null)
    setExpression((value) => value.slice(0, -1))
    setJustEvaluated(false)
  }

  function append(value: string) {
    setError(null)
    const isOperator = '+-*/'.includes(value)
    setExpression((current) => {
      if (justEvaluated && !isOperator) return value
      if (justEvaluated && isOperator) return `${result}${value}`
      if (current.length >= 120) return current
      return `${current}${value}`
    })
    setJustEvaluated(false)
  }

  function calculate() {
    if (!expression.trim()) {
      setError('请先输入算式')
      return
    }
    try {
      const nextResult = formatResult(calculateExpression(expression))
      setResult(nextResult)
      setHistory((items) => [
        { id: createId('calculation'), expression, result: nextResult },
        ...items,
      ].slice(0, 20))
      setError(null)
      setJustEvaluated(true)
    } catch (caught) {
      setError(caught instanceof CalculatorError ? caught.message : '无法完成计算')
      setJustEvaluated(false)
    }
  }

  function handleButton(value: string) {
    if (value === 'clear') clear()
    else if (value === 'equals') calculate()
    else append(value)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (/^[0-9.+\-*/()]$/.test(event.key)) {
      event.preventDefault()
      append(event.key)
    } else if (event.key === 'Enter' || event.key === '=') {
      event.preventDefault()
      calculate()
    } else if (event.key === 'Backspace') {
      event.preventDefault()
      backspace()
    } else if (event.key === 'Escape' || event.key === 'Delete') {
      event.preventDefault()
      clear()
    }
  }

  return (
    <section
      ref={rootRef}
      tabIndex={0}
      className={`os-app os-app--${settings.theme} calculator-app`}
      style={appAccentStyle(settings)}
      onKeyDown={handleKeyDown}
      aria-label="计算器"
    >
      <main className="calculator-main">
        <div className="calculator-display" aria-live="polite">
          <div className="calculator-display__expression">
            {expression ? presentExpression(expression) : '准备计算'}
          </div>
          <output className={error ? 'has-error' : ''} aria-label="计算结果">
            {error ?? result}
          </output>
        </div>
        <div className="calculator-actions">
          <span>{expression.length}/120</span>
          <IconButton label="退格" onClick={backspace} disabled={!expression}>
            <Delete size={18} />
          </IconButton>
        </div>
        <div className="calculator-keypad" aria-label="计算器按键">
          {calculatorButtons.map((button) => (
            <button
              type="button"
              key={`${button.value}-${button.label}`}
              className={`calculator-key calculator-key--${button.kind.replace(' ', ' calculator-key--')}`}
              onClick={() => handleButton(button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </main>
      <aside className="calculator-history">
        <header>
          <div><History size={17} /><h1>历史记录</h1></div>
          <IconButton label="清空历史记录" onClick={() => setHistory([])} disabled={history.length === 0}>
            <Trash2 size={16} />
          </IconButton>
        </header>
        <div className="calculator-history__list app-scroll-area">
          {history.map((record) => (
            <button
              type="button"
              key={record.id}
              onClick={() => {
                setExpression(record.result)
                setResult(record.result)
                setError(null)
                setJustEvaluated(false)
                rootRef.current?.focus()
              }}
            >
              <span>{presentExpression(record.expression)}</span>
              <strong>= {record.result}</strong>
            </button>
          ))}
          {history.length === 0 && (
            <div className="app-empty-state app-empty-state--compact">
              <Calculator size={28} />
              <h2>还没有计算记录</h2>
              <p>完成的算式会出现在这里。</p>
            </div>
          )}
        </div>
      </aside>
    </section>
  )
}

