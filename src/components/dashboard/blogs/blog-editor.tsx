import { RichTextEditor } from '@/components/rich-text-editor'

type BlogEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

/**
 * Rich text editor for blog content. Wraps the shared dependency-free
 * contentEditable editor so the blog module has a stable, named entry point
 * (swap the implementation here to move to Tiptap/Quill later).
 */
export function BlogEditor({
  value,
  onChange,
  placeholder = 'Write your post…',
  className,
}: BlogEditorProps) {
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )
}
