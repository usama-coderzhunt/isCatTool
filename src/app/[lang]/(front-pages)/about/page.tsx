import { SystemMode } from '@/@core/types'
import AboutUsWrapper from '@/views/front-pages/about/page'

const about = ({ mode }: { mode: SystemMode }) => {
  return <AboutUsWrapper mode={mode} />
}

export default about
