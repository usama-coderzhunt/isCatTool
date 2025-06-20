import { Card, CardContent, CardActions, Skeleton } from '@mui/material'

const BlogSkeletonCard = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant='rectangular' height={200} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant='text' height={40} />
        <Skeleton variant='text' height={20} />
        <Skeleton variant='text' height={20} />
        <Skeleton variant='text' height={20} />
      </CardContent>
      <CardActions>
        <Skeleton variant='rectangular' width={100} height={36} />
      </CardActions>
    </Card>
  )
}

export default BlogSkeletonCard
