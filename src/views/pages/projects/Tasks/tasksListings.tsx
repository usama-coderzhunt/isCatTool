'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Typography } from '@mui/material'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useParams } from 'next/navigation'
import TasksTable from './tasksTable'
import AddTaskModal from './addTaskModal'
import { TasksTypes } from '@/types/tasksTypes'

const TasksListing = ({ projectId }: { projectId?: number | undefined }) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)

  const [open, setOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TasksTypes | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [taskID, setTaskID] = useState<number | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  const handleOpen = (mode: 'create' | 'edit', task?: TasksTypes) => {
    setModalMode(mode)
    setSelectedTask(task ?? null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between'>
          <Typography variant='h3' className='font-medium'>
            {t('tasks.title')}
          </Typography>
          <div className='flex flex-row gap-2'>
            {hasPermissions(userPermissions, ['delete_task']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                onClick={() => {
                  setMultiple(true)
                  setDeleteModalOpen(true)
                }}
              >
                {t('tasks.bulkDeleteBtnText')}
              </Button>
            ) : undefined}

            {hasPermissions(userPermissions, ['add_task']) && (
              <Button variant='contained' color='primary' className='shadow-2xl' onClick={() => handleOpen('create')}>
                {t('tasks.addBtnText')}
              </Button>
            )}
          </div>
        </div>

        <div className='mt-8'>
          <TasksTable
            handleOpen={handleOpen}
            setTaskID={setTaskID}
            projectId={projectId}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            multiple={multiple}
            setMultiple={setMultiple}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
          />
        </div>
      </div>
      <AddTaskModal
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
        taskData={selectedTask}
        taskID={taskID}
        mode={modalMode}
        title={modalMode === 'create' ? t('tasks.form.add') : t('tasks.form.update')}
        projectId={projectId}
      />
    </div>
  )
}

export default TasksListing
