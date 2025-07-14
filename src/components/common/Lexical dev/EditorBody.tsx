import { useEffect, useRef } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { Box } from '@mui/material'
import { $generateNodesFromDOM } from '@lexical/html'
import { $getRoot } from 'lexical'

import HtmlOutput from './HtmlOutPut'
import Toolbar from './ToolBar'

export const EditorBody = ({
  value,
  setValue,
  height,
  disabled
}: {
  value: string
  setValue?: (val: string) => void
  height?: string
  disabled?: boolean
}) => {
  const [editor] = useLexicalComposerContext()
  const hasHydrated = useRef(false)
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (!editor || isInternalChange.current) {
      isInternalChange.current = false

      return
    }

    if (value === '') {
      editor.update(() => {
        const root = $getRoot()

        root.clear()
      })
      hasHydrated.current = false

      return
    }

    if (!value || hasHydrated.current) return

    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(value, 'text/html')
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()

      root.clear()
      root.append(...nodes)
      hasHydrated.current = true
    })
  }, [editor, value])

  // Handle updates from editor to parent
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      isInternalChange.current = true
    })
  }, [editor])

  return (
    <Box
      className='flex flex-col gap-2 border border-border bg-backgroundPrimary rounded-md shadow-sm p-4'
      style={{ minHeight: height }}
    >
      <Toolbar disabled={disabled} />
      <Box className='editor-container p-2 border border-border bg-backgroundPaper rounded min-h-[200px]'>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className='editor-input outline-none min-h-[150px] whitespace-pre-wrap break-words w-full' />
          }
          placeholder={<div className='editor-placeholder text-sm text-textSecondary'>Enter text...</div>}
          ErrorBoundary={() => <div>Editor Error</div>}
        />
        <HistoryPlugin />
        <HtmlOutput setValue={setValue} />
      </Box>
    </Box>
  )
}
