import { Dialog, DialogContent, DialogTitle, Button } from '@mui/material'

interface DeleteConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title: string
  description: string
}

const DeleteConfirmationModal = ({ open, onClose, onConfirm, loading, title, description }: DeleteConfirmationModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <div className='mt-4 flex flex-col gap-5'>
          <p>{description}</p>
          <div className='flex justify-end gap-4 mt-4'>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              onClick={onConfirm}
              variant='contained'
              color='error'
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmationModal 
