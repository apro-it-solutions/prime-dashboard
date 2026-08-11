import { useEffect, useRef } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Quote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type RichTextEditorProps = {
  /** HTML content (controlled). */
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

type ToolbarAction = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  command: string
  value?: string
}

const ACTIONS: (ToolbarAction | 'divider')[] = [
  { icon: Bold, label: 'Bold', command: 'bold' },
  { icon: Italic, label: 'Italic', command: 'italic' },
  { icon: Underline, label: 'Underline', command: 'underline' },
  'divider',
  { icon: Heading2, label: 'Heading', command: 'formatBlock', value: 'H2' },
  { icon: Heading3, label: 'Subheading', command: 'formatBlock', value: 'H3' },
  { icon: Quote, label: 'Quote', command: 'formatBlock', value: 'BLOCKQUOTE' },
  'divider',
  { icon: List, label: 'Bullet list', command: 'insertUnorderedList' },
  { icon: ListOrdered, label: 'Numbered list', command: 'insertOrderedList' },
  'divider',
  { icon: Undo2, label: 'Undo', command: 'undo' },
  { icon: Redo2, label: 'Redo', command: 'redo' },
]

/**
 * Lightweight, dependency-free rich text editor built on a contentEditable
 * region and `document.execCommand`. Emits HTML via `onChange`.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Sync external value into the DOM only when it diverges and the editor is
  // not focused, to avoid clobbering the caret while typing.
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
  }, [value])

  const exec = (action: ToolbarAction) => {
    editorRef.current?.focus()
    document.execCommand(action.command, false, action.value)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const insertLink = () => {
    const url = window.prompt('Enter URL')
    if (!url) return
    editorRef.current?.focus()
    document.execCommand('createLink', false, url)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring',
        className
      )}
    >
      <div className='flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1'>
        {ACTIONS.map((action, i) =>
          action === 'divider' ? (
            <Separator
              key={`d-${i}`}
              orientation='vertical'
              className='mx-0.5 h-5'
            />
          ) : (
            <button
              key={action.label}
              type='button'
              title={action.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(action)}
              className='inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            >
              <action.icon className='size-4' />
            </button>
          )
        )}
        <button
          type='button'
          title='Insert link'
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          className='inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        >
          <LinkIcon className='size-4' />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role='textbox'
        aria-multiline='true'
        data-placeholder={placeholder}
        onInput={handleInput}
        className={cn(
          'prose prose-sm dark:prose-invert min-h-40 max-w-none px-3 py-2 text-sm focus:outline-none',
          // Placeholder shown when empty.
          'empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]',
          '[&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold',
          '[&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold',
          '[&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6',
          '[&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground',
          '[&_a]:text-primary [&_a]:underline'
        )}
      />
    </div>
  )
}
