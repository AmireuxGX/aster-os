import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Asterisk, Maximize2, Minimize2, Minus, X } from 'lucide-react'
import { Rnd } from 'react-rnd'
import type { AppDefinition, AppRuntimeProps, WindowBounds, WindowInstance } from '../types'
import './window-frame.css'

const BOOT_EXIT_DELAY = 2_250
const BOOT_COMPLETE_DELAY = 2_700

type MoveBounds = Pick<WindowBounds, 'x' | 'y'>

export interface WindowFrameProps {
  window: WindowInstance
  app: AppDefinition
  active: boolean
  mobile?: boolean
  runtime?: AppRuntimeProps
  children?: ReactNode
  onFocus: (id: string) => void
  onMinimize: (id: string) => void
  onToggleMaximize: (id: string) => void
  onClose: (id: string) => void
  onBoundsChange?: (bounds: WindowBounds) => void
  onMove?: (id: string, bounds: MoveBounds) => void
  onResize?: (id: string, bounds: WindowBounds) => void
}

export interface BootScreenProps {
  visible?: boolean
  onComplete?: () => void
}

interface WindowControlProps {
  label: string
  tooltipId: string
  tone?: 'default' | 'danger'
  onClick: () => void
  children: ReactNode
}

const resizeHandleClasses = {
  top: 'window-frame__resize-handle window-frame__resize-handle--top',
  right: 'window-frame__resize-handle window-frame__resize-handle--right',
  bottom: 'window-frame__resize-handle window-frame__resize-handle--bottom',
  left: 'window-frame__resize-handle window-frame__resize-handle--left',
  topRight: 'window-frame__resize-handle window-frame__resize-handle--top-right',
  bottomRight: 'window-frame__resize-handle window-frame__resize-handle--bottom-right',
  bottomLeft: 'window-frame__resize-handle window-frame__resize-handle--bottom-left',
  topLeft: 'window-frame__resize-handle window-frame__resize-handle--top-left',
}

function WindowControl({
  label,
  tooltipId,
  tone = 'default',
  onClick,
  children,
}: WindowControlProps) {
  return (
    <span className="window-frame__control-wrap">
      <button
        className={`window-frame__control window-frame__control--${tone}`}
        type="button"
        aria-label={label}
        aria-describedby={tooltipId}
        onClick={onClick}
      >
        {children}
      </button>
      <span className="window-frame__tooltip" id={tooltipId} role="tooltip">
        {label}
      </span>
    </span>
  )
}

export function WindowFrame({
  window,
  app,
  active,
  mobile = false,
  runtime,
  children,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onClose,
  onBoundsChange,
  onMove,
  onResize,
}: WindowFrameProps) {
  const titleId = useId()
  const AppIcon = app.icon
  const AppComponent = app.component
  const fillsWorkspace = mobile || window.maximized
  const canManipulate = !fillsWorkspace

  const position = fillsWorkspace ? { x: 0, y: 0 } : { x: window.bounds.x, y: window.bounds.y }
  const size = fillsWorkspace
    ? { width: '100%', height: '100%' }
    : { width: window.bounds.width, height: window.bounds.height }

  const frameStyle = {
    zIndex: window.zIndex,
    display: window.minimized ? 'none' : undefined,
    '--window-app-accent': app.accent,
  } as CSSProperties

  const commitMove = (nextPosition: MoveBounds) => {
    const roundedPosition = {
      x: Math.round(nextPosition.x),
      y: Math.round(nextPosition.y),
    }

    onMove?.(window.id, roundedPosition)
    onBoundsChange?.({ ...window.bounds, ...roundedPosition })
  }

  const commitResize = (nextBounds: WindowBounds) => {
    const roundedBounds = {
      x: Math.round(nextBounds.x),
      y: Math.round(nextBounds.y),
      width: Math.round(nextBounds.width),
      height: Math.round(nextBounds.height),
    }

    onResize?.(window.id, roundedBounds)
    onBoundsChange?.(roundedBounds)
  }

  const handleTitlebarDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (mobile || (event.target as HTMLElement).closest('.window-frame__controls')) return
    onToggleMaximize(window.id)
  }

  return (
    <Rnd
      bounds="parent"
      className={`window-frame${active ? ' window-frame--active' : ''}${
        fillsWorkspace ? ' window-frame--workspace-fill' : ''
      }${mobile ? ' window-frame--mobile' : ''}`}
      style={frameStyle}
      position={position}
      size={size}
      minWidth={canManipulate ? app.minSize.width : 0}
      minHeight={canManipulate ? app.minSize.height : 0}
      maxWidth="100%"
      maxHeight="100%"
      dragHandleClassName="window-frame__titlebar"
      cancel=".window-frame__control, .window-frame__content, [data-no-drag]"
      disableDragging={!canManipulate}
      enableResizing={canManipulate}
      resizeHandleClasses={resizeHandleClasses}
      onDragStart={() => onFocus(window.id)}
      onDragStop={(_, data) => commitMove({ x: data.x, y: data.y })}
      onResizeStart={() => onFocus(window.id)}
      onResizeStop={(_, __, element, ___, nextPosition) =>
        commitResize({
          x: nextPosition.x,
          y: nextPosition.y,
          width: element.offsetWidth,
          height: element.offsetHeight,
        })
      }
    >
      <section
        className="window-frame__surface"
        aria-labelledby={titleId}
        aria-hidden={window.minimized}
        onPointerDownCapture={() => onFocus(window.id)}
      >
        <header className="window-frame__titlebar" onDoubleClick={handleTitlebarDoubleClick}>
          <div className="window-frame__identity">
            <span className="window-frame__app-icon" aria-hidden="true">
              <AppIcon size={15} strokeWidth={1.9} />
            </span>
            <span className="window-frame__title" id={titleId}>
              {window.title || app.title}
            </span>
            <span className="window-frame__frame-code" aria-hidden="true">
              {app.id.slice(0, 2).toUpperCase()} · 01
            </span>
          </div>

          <div className="window-frame__controls" aria-label="窗口控制" data-no-drag>
            <WindowControl
              label="最小化"
              tooltipId={`${titleId}-minimize`}
              onClick={() => onMinimize(window.id)}
            >
              <Minus size={15} strokeWidth={1.8} aria-hidden="true" />
            </WindowControl>

            {!mobile && (
              <WindowControl
                label={window.maximized ? '还原窗口' : '最大化'}
                tooltipId={`${titleId}-maximize`}
                onClick={() => onToggleMaximize(window.id)}
              >
                {window.maximized ? (
                  <Minimize2 size={14} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Maximize2 size={14} strokeWidth={1.8} aria-hidden="true" />
                )}
              </WindowControl>
            )}

            <WindowControl
              label="关闭"
              tooltipId={`${titleId}-close`}
              tone="danger"
              onClick={() => onClose(window.id)}
            >
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
            </WindowControl>
          </div>
        </header>

        <div className="window-frame__content">
          {children ?? (runtime ? <AppComponent {...runtime} /> : null)}
        </div>
      </section>
    </Rnd>
  )
}

export function BootScreen({ visible = true, onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<'entering' | 'exiting' | 'complete'>('entering')
  const completionRef = useRef(onComplete)

  useEffect(() => {
    completionRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!visible) return

    setPhase('entering')
    const exitTimer = window.setTimeout(() => setPhase('exiting'), BOOT_EXIT_DELAY)
    const completeTimer = window.setTimeout(() => {
      setPhase('complete')
      completionRef.current?.()
    }, BOOT_COMPLETE_DELAY)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [visible])

  if (!visible || phase === 'complete') return null

  return (
    <div
      className={`boot-screen${phase === 'exiting' ? ' boot-screen--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Aster OS 正在启动"
      aria-busy="true"
    >
      <div className="boot-screen__center">
        <span className="boot-screen__mark" aria-hidden="true">
          <Asterisk size={38} strokeWidth={1.55} />
        </span>
        <div className="boot-screen__brand" aria-hidden="true">
          Aster <span>OS</span>
        </div>
        <div className="boot-screen__progress" aria-hidden="true">
          <span />
        </div>
        <p className="boot-screen__status">正在准备桌面</p>
      </div>
    </div>
  )
}

