import { SystemMode } from '@/@core/types'
import BlogsPageWrapper from '@/views/front-pages/Blogs/page'

const Blogs = ({ mode }: { mode: SystemMode }) => {
  return <BlogsPageWrapper mode={mode} />
}

export default Blogs
