import { SystemMode } from '@/@core/types'
import ServicesPageWrapper from '@/views/front-pages/services/page'

const Services = ({ mode }: { mode: SystemMode }) => {
  return <ServicesPageWrapper mode={mode} />
}

export default Services
