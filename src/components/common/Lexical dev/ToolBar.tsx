import { useEffect, useState } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { TextFormatType } from 'lexical'
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical'
import type { HeadingTagType } from '@lexical/rich-text'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'

type FormatType = TextFormatType

export const Toolbar = ({ disabled }: { disabled?: boolean }) => {
  const [editor] = useLexicalComposerContext()

  const [formats, setFormats] = useState<Record<FormatType, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    subscript: false,
    superscript: false,
    highlight: false,
    lowercase: false,
    uppercase: false,
    capitalize: false
  })

  const [activeHeading, setActiveHeading] = useState<HeadingTagType | null>(null)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          // Text formats
          setFormats({
            bold: selection.hasFormat('bold'),
            italic: selection.hasFormat('italic'),
            underline: selection.hasFormat('underline'),
            strikethrough: selection.hasFormat('strikethrough'),
            code: selection.hasFormat('code'),
            subscript: selection.hasFormat('subscript'),
            superscript: selection.hasFormat('superscript'),
            highlight: selection.hasFormat('highlight'),
            lowercase: selection.hasFormat('lowercase'),
            uppercase: selection.hasFormat('uppercase'),
            capitalize: selection.hasFormat('capitalize')
          })

          // Check for heading
          const anchorNode = selection.anchor.getNode()
          const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElement()

          if ($isHeadingNode(element)) {
            setActiveHeading(element.getTag())
          } else {
            setActiveHeading(null)
          }
        }
      })
    })
  }, [editor])

  const format = (type: FormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type)
  }

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag))
      }
    })
  }

  const clearFormat = () => {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        selection.formatText('bold')
        selection.formatText('italic')
        selection.formatText('underline')
        selection.formatText('strikethrough')
        selection.formatText('code')
        selection.formatText('subscript')
        selection.formatText('superscript')
        selection.formatText('highlight')
        selection.formatText('lowercase')
        selection.formatText('uppercase')
        selection.formatText('capitalize')
      }
    })
  }

  const baseClass = 'border px-2 py-1 rounded text-sm transition'
  const activeClass = 'bg-primary text-white shadow-inner scale-105'

  return (
    <div className='flex gap-2 mb-2 flex-wrap'>
      <div className='flex gap-2 items-center border-r pr-2 mr-2'>
        <button
          className={`${baseClass} ${activeHeading === 'h1' ? activeClass : ''}`}
          onClick={() => formatHeading('h1')}
          disabled={disabled}
          type='button'
          title='Heading 1'
        >
          <i className='tabler-h-1 text-base' />
        </button>
        <button
          className={`${baseClass} ${activeHeading === 'h2' ? activeClass : ''}`}
          onClick={() => formatHeading('h2')}
          disabled={disabled}
          type='button'
          title='Heading 2'
        >
          <i className='tabler-h-2 text-base' />
        </button>
        <button
          className={`${baseClass} ${activeHeading === 'h3' ? activeClass : ''}`}
          onClick={() => formatHeading('h3')}
          disabled={disabled}
          type='button'
          title='Heading 3'
        >
          <i className='tabler-h-3 text-base' />
        </button>
      </div>
      <div className='flex gap-2 items-center'>
        <button
          className={`${baseClass} ${formats.bold ? activeClass : ''}`}
          onClick={() => format('bold')}
          disabled={disabled}
          type='button'
        >
          <i className='tabler-bold text-base' />
        </button>
        <button
          className={`${baseClass} ${formats.italic ? activeClass : ''}`}
          onClick={() => format('italic')}
          disabled={disabled}
          type='button'
        >
          <i className='tabler-italic text-base' />
        </button>
        <button
          className={`${baseClass} ${formats.underline ? activeClass : ''}`}
          onClick={() => format('underline')}
          disabled={disabled}
          type='button'
        >
          <i className='tabler-underline text-base' />
        </button>
        <button
          className={`${baseClass} ${formats.strikethrough ? activeClass : ''}`}
          onClick={() => format('strikethrough')}
          disabled={disabled}
          type='button'
          title='Strikethrough'
        >
          <i className='tabler-strikethrough text-base' />
        </button>
        <button
          className={`${baseClass} ${formats.code ? activeClass : ''}`}
          onClick={() => format('code')}
          disabled={disabled}
          type='button'
        >
          <i className='tabler-code text-base' />
        </button>
        <button className={baseClass} onClick={clearFormat} disabled={disabled} type='button' title='Clear formatting'>
          <i className='tabler-clear-formatting text-base' />
        </button>
      </div>
    </div>
  )
}

export default Toolbar
