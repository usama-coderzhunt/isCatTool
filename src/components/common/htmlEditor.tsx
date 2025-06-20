import React from 'react'
import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface HTMLEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  height?: string
}

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  value = '<h1>Hello, world!</h1>',
  onChange,
  disabled = false,
  height = '350px'
}) => {
  const { t } = useTranslation('global')
  const [html, setHtml] = useState(value)

  useEffect(() => {
    if (value !== html) {
      setHtml(value)
    }
  }, [value])

  const handleChange = (newHtml: string) => {
    setHtml(newHtml)
    if (onChange) {
      onChange(newHtml)
    }
  }

  return (
    <Box className='flex flex-row flex-wrap gap-6 p-4 bg-backgroundPrimary rounded-lg shadow-sm'>
      <Box className='flex-1 border border-border p-6 bg-backgroundPrimary rounded-md shadow-sm'>
        <h2 className='text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2'>
          <i className='tabler-code text-xl'></i>
          {t('htmlEditor.editor')}
        </h2>
        <textarea
          value={html}
          onChange={e => handleChange(e.target.value)}
          rows={6}
          disabled={disabled}
          className={`w-full font-mono text-sm h-[${height}] ${
            disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-text'
          } p-3 border border-border rounded bg-backgroundPaper resize-none transition-all duration-200 outline-none`}
        />
      </Box>
      <Box className='flex-1 border border-border p-6 bg-backgroundPaper rounded-md shadow-sm'>
        <h2 className='text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2'>
          <i className='tabler-eye text-xl'></i>
          {t('htmlEditor.preview')}
        </h2>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className={`font-sans h-[${height}] overflow-y-auto p-3 border border-border rounded bg-backgroundPaper`}
        />
      </Box>
    </Box>
  )
}

export default HTMLEditor
