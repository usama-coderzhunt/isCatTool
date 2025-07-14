import * as React from 'react'
import { useTranslation } from 'next-i18next'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import FileUploaderSingle from '@/components/fileUploader'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useTermBaseHooks } from '@/services/useTermBaseHooks'
import { toast } from 'react-toastify'

interface ImportTermBaseModalProps {
  open: boolean
  handleClose: () => void
  termBaseId: number
}

const ImportTermBaseModal = ({ open, handleClose, termBaseId }: ImportTermBaseModalProps) => {
  const { t } = useTranslation('global')
  const [file, setFile] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // API Hook
  const { useImportTermBase } = useTermBaseHooks()
  const { mutate: importTermBase } = useImportTermBase(Number(termBaseId))

  const handleCloseModal = () => {
    handleClose()
    setFile([])
  }

  const handleImport = () => {
    if (!file || file.length === 0) {
      return
    }

    setIsLoading(true)

    importTermBase(
      {
        file: file[0]
      },
      {
        onSuccess: () => {
          toast.success(t('termBases.toasts.termBaseImportedSuccess'))
          handleCloseModal()
          setIsLoading(false)
        },
        onError: () => {
          setIsLoading(false)
        }
      }
    )
  }

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      sx={{
        overflow: 'auto !important',
        scrollbarWidth: 'none !important',
        '&::-webkit-scrollbar': {
          display: 'none !important'
        }
      }}
      slotProps={{
        backdrop: {
          timeout: 500
        }
      }}
    >
      <Fade in={open}>
        <Box sx={{ ...modalStyles, width: 450 }}>
          <div className='flex gap-x-2 justify-between items-center mb-6'>
            <Typography variant='h4'>{t('termBases.importModal.title')}</Typography>
            <Button
              onClick={handleCloseModal}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>

          <Box
            sx={{
              overflowY: 'auto',
              flexGrow: 1,
              maxHeight: 'calc(100vh - 20px)',
              scrollbarWidth: 'none !important',
              '&::-webkit-scrollbar': {
                display: 'none !important'
              }
            }}
          >
            <div className='flex flex-col gap-6'>
              <div>
                <Typography variant='body2' className='text-textSecondary mb-2'>
                  {t('termBases.importModal.uploadFile')}
                </Typography>

                <FileUploaderSingle
                  files={file}
                  setFiles={setFile}
                  resetFiles={() => setFile([])}
                  errorMessage=''
                  allowedExtensions={{ 'text/csv': ['.csv'] }}
                />
              </div>
              <div className='w-full flex justify-end gap-3'>
                <Button variant='outlined' onClick={handleCloseModal} disabled={isLoading}>
                  {t('termBases.importModal.cancel')}
                </Button>
                <Button variant='contained' onClick={handleImport} disabled={!file || file.length === 0 || isLoading}>
                  {t('termBases.importModal.import')}
                </Button>
              </div>
            </div>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ImportTermBaseModal
