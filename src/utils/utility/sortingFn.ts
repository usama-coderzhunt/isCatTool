import { SortingState } from "@tanstack/react-table"

  export const getOrderingParam = (sorting: SortingState) => {
    if (!sorting || sorting.length === 0) return undefined
    
    const column = sorting[0].id
    const direction = sorting[0].desc ? '-' : ''
 
    
    const apiField = column
    return `${direction}${apiField}`
  }
