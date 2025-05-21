import { TodoItem } from "@/types/todoItems"

export const mapTodoItemData = (data: TodoItem) => {
    return { ...data }
}
