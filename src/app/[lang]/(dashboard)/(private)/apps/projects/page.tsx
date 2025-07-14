'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { Button, Typography } from '@mui/material'
import ProjectsTable from '@/views/pages/projects/ProjectsTable'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import AddProjectModal from '@/views/pages/projects/AddProjectModal'

const Projects = () => {
  const [open, setOpen] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [projectID, setProjectID] = useState<number | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  const userPermissions = useAuthStore(state => state.userPermissions)
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const handleOpen = (mode: 'view' | 'create' | 'edit', project?: any) => {
    setModalMode(mode)
    setSelectedProject(project ?? null)
    setOpen(true)
    setProjectID(project?.id ?? null)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedProject(null)
    setProjectID(null)
  }

  return (
    <>
      <div className='py-4 w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between'>
          <Typography variant='h3' className='font-semibold'>
            {t('projects.title')}
          </Typography>
          <div className='flex flex-row gap-2'>
            {/* Add permission checks for delete and add as needed */}
            {hasPermissions(userPermissions, ['delete_project']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                sx={{ padding: '0.5rem 1rem' }}
                onClick={() => {
                  setMultiple(true)
                  setOpenDeleteModal(true)
                }}
              >
                {t('projects.bulkDeleteBtnText')}
              </Button>
            ) : null}
            {hasPermissions(userPermissions, ['add_project']) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ padding: '0.5rem 1rem' }}
                onClick={() => handleOpen('create')}
              >
                {t('projects.addBtnText')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className='mt-8'>
        <ProjectsTable
          handleOpen={handleOpen}
          setProjectID={setProjectID}
          userPermissions={userPermissions}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          multiple={multiple}
          setMultiple={setMultiple}
          setOpenDeleteModal={setOpenDeleteModal}
          openDeleteModal={openDeleteModal}
        />
      </div>
      <AddProjectModal
        open={open}
        handleClose={handleClose}
        projectData={selectedProject}
        projectID={projectID}
        mode={modalMode}
        title={modalMode === 'create' ? t('projects.addProjectModal.add') : t('projects.addProjectModal.update')}
      />
    </>
  )
}

export default Projects
