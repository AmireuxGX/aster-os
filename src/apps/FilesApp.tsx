import { useMemo, useState } from 'react'
import {
  AppWindow,
  ChevronRight,
  File,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  Grid3X3,
  Image,
  List as ListIcon,
  MoreHorizontal,
  Play,
} from 'lucide-react'
import type { AppId, AppRuntimeProps } from '../types'
import { appAccentStyle, IconButton } from './shared'

type FileKind = 'folder' | 'text' | 'document' | 'image' | 'app' | 'unknown'

interface FileItem {
  id: string
  name: string
  kind: FileKind
  updatedAt: number
  size?: string
  content?: string
  appId?: AppId
  directory?: DirectoryId
}

type DirectoryId = 'home' | 'work' | 'resources' | 'archive'

const now = Date.now()
const directoryNames: Record<DirectoryId, string> = {
  home: '主页',
  work: '工作',
  resources: '资料',
  archive: '归档',
}

const fileSystem: Record<DirectoryId, FileItem[]> = {
  home: [
    { id: 'folder-work', name: '工作', kind: 'folder', directory: 'work', updatedAt: now - 1000 * 60 * 12 },
    { id: 'folder-resources', name: '资料', kind: 'folder', directory: 'resources', updatedAt: now - 1000 * 60 * 90 },
    { id: 'folder-archive', name: '归档', kind: 'folder', directory: 'archive', updatedAt: now - 1000 * 60 * 60 * 24 * 8 },
    { id: 'app-browser', name: '浏览器', kind: 'app', appId: 'browser', updatedAt: now, size: '应用' },
    { id: 'app-writer', name: '文档编辑器', kind: 'app', appId: 'writer', updatedAt: now, size: '应用' },
  ],
  work: [
    { id: 'doc-plan', name: '项目计划.aDoc', kind: 'document', appId: 'writer', updatedAt: now - 1000 * 60 * 18, size: '18 KB' },
    { id: 'note-ideas', name: '灵感清单.note', kind: 'text', appId: 'notes', updatedAt: now - 1000 * 60 * 44, size: '4 KB' },
    {
      id: 'txt-readme',
      name: '说明.txt',
      kind: 'text',
      updatedAt: now - 1000 * 60 * 60 * 3,
      size: '2 KB',
      content: '这是 Aster 文件管理器的示例文件。\n\n双击文档或应用可在对应窗口中打开；普通文本文件会显示在右侧预览区。',
    },
    { id: 'app-terminal', name: '终端', kind: 'app', appId: 'terminal', updatedAt: now, size: '应用' },
  ],
  resources: [
    {
      id: 'code-config',
      name: 'settings.json',
      kind: 'text',
      updatedAt: now - 1000 * 60 * 60 * 21,
      size: '1 KB',
      content: '{\n  "workspace": "Aster Desktop",\n  "autosave": true,\n  "language": "zh-CN"\n}',
    },
    { id: 'image-wallpaper', name: '桌面背景.jpg', kind: 'image', updatedAt: now - 1000 * 60 * 60 * 24 * 2, size: '2.8 MB' },
    { id: 'unknown-cache', name: 'snapshot.bin', kind: 'unknown', updatedAt: now - 1000 * 60 * 60 * 24 * 3, size: '640 KB' },
    { id: 'app-settings', name: '设置', kind: 'app', appId: 'settings', updatedAt: now, size: '应用' },
  ],
  archive: [],
}

function FileTypeIcon({ kind }: { kind: FileKind }) {
  if (kind === 'folder') return <Folder size={26} />
  if (kind === 'document') return <FileText size={25} />
  if (kind === 'text') return <FileCode2 size={24} />
  if (kind === 'image') return <Image size={24} />
  if (kind === 'app') return <AppWindow size={24} />
  return <File size={24} />
}

function formatFileTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function FilesApp({ openApp, notify, settings }: AppRuntimeProps) {
  const [directory, setDirectory] = useState<DirectoryId>('home')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const items = fileSystem[directory]
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId])

  function enterDirectory(nextDirectory: DirectoryId) {
    setDirectory(nextDirectory)
    setSelectedId(null)
  }

  function openItem(item: FileItem) {
    if (item.kind === 'folder' && item.directory) {
      enterDirectory(item.directory)
      return
    }
    if (item.appId) {
      openApp(item.appId)
      notify('文件', `正在打开“${item.name}”。`)
      return
    }
    setSelectedId(item.id)
    if (item.kind === 'unknown') {
      notify('无法预览', '该文件类型没有可用的预览器。')
    }
  }

  return (
    <section
      className={`os-app os-app--${settings.theme} files-app`}
      style={appAccentStyle(settings)}
      aria-label="文件"
    >
      <header className="app-toolbar files-toolbar">
        <nav className="files-breadcrumb" aria-label="当前位置">
          <button type="button" onClick={() => enterDirectory('home')} aria-current={directory === 'home' ? 'page' : undefined}>
            <FolderOpen size={16} /> 主页
          </button>
          {directory !== 'home' && (
            <>
              <ChevronRight size={14} aria-hidden="true" />
              <span>{directoryNames[directory]}</span>
            </>
          )}
        </nav>
        <span className="app-toolbar__spacer" />
        <div className="app-segmented-control" aria-label="文件显示方式">
          <IconButton label="网格视图" active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
            <Grid3X3 size={16} />
          </IconButton>
          <IconButton label="列表视图" active={viewMode === 'list'} onClick={() => setViewMode('list')}>
            <ListIcon size={17} />
          </IconButton>
        </div>
        <IconButton label="更多文件操作" disabled>
          <MoreHorizontal size={17} />
        </IconButton>
      </header>

      <div className="files-layout">
        <main className="files-content app-scroll-area">
          <header className="files-content__heading">
            <div><h1>{directoryNames[directory]}</h1><span>{items.length} 个项目</span></div>
          </header>
          {items.length > 0 ? (
            <div className={`files-items files-items--${viewMode}`} role="list" aria-label={`${directoryNames[directory]}中的文件`}>
              {viewMode === 'list' && (
                <div className="files-list-header" aria-hidden="true">
                  <span>名称</span><span>修改时间</span><span>类型</span><span>大小</span>
                </div>
              )}
              {items.map((item) => (
                <button
                  type="button"
                  role="listitem"
                  key={item.id}
                  className={`files-item files-item--${item.kind}${selectedId === item.id ? ' is-selected' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  onDoubleClick={() => openItem(item)}
                >
                  <span className="files-item__icon"><FileTypeIcon kind={item.kind} /></span>
                  <span className="files-item__name">{item.name}</span>
                  {viewMode === 'list' && (
                    <>
                      <time dateTime={new Date(item.updatedAt).toISOString()}>{formatFileTime(item.updatedAt)}</time>
                      <span>{item.kind === 'folder' ? '文件夹' : item.kind === 'app' ? '应用' : '文件'}</span>
                      <span>{item.size ?? '--'}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="app-empty-state">
              <FolderOpen size={36} />
              <h2>这个文件夹是空的</h2>
              <p>归档后的文件会出现在这里。</p>
            </div>
          )}
        </main>

        <aside className="files-preview" aria-label="文件预览">
          {selected ? (
            <>
              <header>
                <span className={`files-preview__icon files-preview__icon--${selected.kind}`}><FileTypeIcon kind={selected.kind} /></span>
                <div><h2>{selected.name}</h2><p>{formatFileTime(selected.updatedAt)}{selected.size ? ` · ${selected.size}` : ''}</p></div>
              </header>
              {selected.content && <pre className="files-preview__text">{selected.content}</pre>}
              {selected.kind === 'image' && (
                <div className="files-preview__image" role="img" aria-label="桌面背景图片预览">
                  <span /><small>图像预览</small>
                </div>
              )}
              {selected.kind === 'unknown' && (
                <div className="app-inline-error files-preview__error" role="alert">
                  没有可用的预览器。可以保留或移动该文件。
                </div>
              )}
              {(selected.kind === 'folder' || selected.appId) && (
                <button className="app-primary-button files-preview__open" type="button" onClick={() => openItem(selected)}>
                  <Play size={15} /> {selected.kind === 'folder' ? '打开文件夹' : '打开'}
                </button>
              )}
            </>
          ) : (
            <div className="app-empty-state app-empty-state--compact">
              <File size={30} />
              <h2>选择一个项目</h2>
              <p>查看文件详情，或双击打开。</p>
            </div>
          )}
        </aside>
      </div>
      <footer className="app-statusbar">
        <span>{selected ? `已选择：${selected.name}` : `${items.length} 个项目`}</span>
        <span>{viewMode === 'grid' ? '网格视图' : '列表视图'}</span>
      </footer>
    </section>
  )
}

