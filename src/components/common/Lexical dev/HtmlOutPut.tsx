import { $generateHtmlFromNodes } from '@lexical/html'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'

const HtmlOutput = ({ setValue }: { setValue?: (html: string) => void }) => {
  const [editor] = useLexicalComposerContext()

  const handleChange = () => {
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor, null)

      setValue?.(html)
    })
  }

  return <OnChangePlugin onChange={handleChange} />
}

export default HtmlOutput
