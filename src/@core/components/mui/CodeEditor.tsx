'use client'

// React Imports
import { forwardRef } from 'react'

// Monaco Editor Imports
import Editor from '@monaco-editor/react'

// MUI Imports
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { red } from '@mui/material/colors'

// Types
interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'css' | 'javascript' | 'html'
  label?: string
  disabled?: boolean
  showAsterisk?: boolean
  placeholder?: string
  height?: string
}

const EditorWrapper = styled(Box)(({ theme }) => ({
  '& .monaco-editor': {
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    '& .monaco-editor-background': {
      backgroundColor: 'var(--mui-palette-background-paper)'
    },
    '& .margin': {
      backgroundColor: 'var(--mui-palette-background-paper)'
    }
  },
  border: `1px solid var(--mui-palette-customColors-inputBorder)`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '&:hover': {
    borderColor: 'var(--mui-palette-action-active)'
  },
  '&.focused': {
    borderWidth: 2,
    borderColor: 'var(--mui-palette-primary-main)',
    boxShadow: 'var(--mui-customShadows-primary-sm)'
  }
}))

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  ({ value, onChange, language = 'javascript', label, disabled, showAsterisk, height = '200px' }, ref) => {
    const renderLabel = () => {
      if (!label) return null
      return (
        <Typography variant='subtitle1' className='mb-2'>
          {label}
          {showAsterisk && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )
    }

    return (
      <Box ref={ref}>
        {renderLabel()}
        <EditorWrapper style={{ direction: 'ltr' }}>
          <Editor
            height={height}
            language={language}
            value={value}
            onChange={value => onChange(value || '')}
            theme='vs-dark'
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              readOnly: disabled,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible'
              },
              padding: {
                top: 8,
                bottom: 8
              }
            }}
            onMount={editor => {
              const wrapper = editor.getContainerDomNode().parentElement
              editor.onDidFocusEditorWidget(() => {
                wrapper?.classList.add('focused')
                editor.getContainerDomNode().style.direction = 'ltr'
              })
              editor.onDidBlurEditorWidget(() => {
                wrapper?.classList.remove('focused')
                editor.getContainerDomNode().style.direction = 'ltr'
              })
            }}
          />
        </EditorWrapper>
      </Box>
    )
  }
)

CodeEditor.displayName = 'CodeEditor'

export default CodeEditor
