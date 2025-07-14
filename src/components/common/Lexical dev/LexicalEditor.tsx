import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'

import { HeadingNode } from '@lexical/rich-text'

import { EditorBody } from './EditorBody'

const theme = {
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-bold'
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through'
  }
}

export interface LexicalEditorHandle {
  reset: () => void
}

interface LexicalEditorProps {
  value?: string
  setValue?: (val: string) => void
  height?: string
  disabled?: boolean
}

const LexicalEditor = forwardRef<LexicalEditorHandle, LexicalEditorProps>(
  ({ value = '', setValue, height = '350px', disabled = false }, ref) => {
    const [editorKey, setEditorKey] = useState(0)

    useImperativeHandle(ref, () => ({
      reset() {
        setValue?.('')
        setEditorKey(prev => prev + 1)
      }
    }))

    const initialConfig = {
      namespace: 'HTMLLexicalEditor',
      theme,
      nodes: [HeadingNode],
      onError: (error: Error) => {
        console.error(error)
      }
    }

    return (
      <LexicalComposer initialConfig={initialConfig} key={editorKey}>
        <EditorBody value={value} setValue={setValue} height={height} disabled={disabled} />
      </LexicalComposer>
    )
  }
)

export default LexicalEditor
