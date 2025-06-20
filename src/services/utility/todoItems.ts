import { TodoItem } from '@/types/todoItems'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const mapTodoItemData = (data: TodoItem) => {
  return { ...data }
}

export const fetchNotification = async (notificationId: number) => {
  try {
    const notification = await axiosInstance
      .get(`${API_ROUTES.NOTIFICATIONS.getNotifications}${notificationId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_notification'
      } as any)
      .then(res => res.data)
    return notification
  } catch (error) {
    console.error('Error fetching notification:', error)
    return []
  }
}

export const fetchTodo = async (todoId: number) => {
  try {
    const todo = await axiosInstance
      .get(`${API_ROUTES.TODOS.getTodos}${todoId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_todo'
      } as any)
      .then(res => res.data)
    return todo
  } catch (error) {
    console.error('Error fetching todo:', error)
    return []
  }
}
