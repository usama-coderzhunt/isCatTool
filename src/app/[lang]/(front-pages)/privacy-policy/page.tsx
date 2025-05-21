import { SystemMode } from '@/@core/types'
import PrivacyPolicyWrapper from '@/views/front-pages/privacy-policy/page'

const privacyPolicy = ({ mode }: { mode: SystemMode }) => {
  return <PrivacyPolicyWrapper mode={mode} />
}

export default privacyPolicy
