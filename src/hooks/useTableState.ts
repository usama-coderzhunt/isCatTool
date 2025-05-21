import { useState, useEffect } from 'react'
import type { MRT_VisibilityState, MRT_DensityState } from 'material-react-table'

interface TableState {
    columnVisibility: MRT_VisibilityState
    density: MRT_DensityState
    isFullScreen: boolean
}

const DEFAULT_TABLE_STATE: TableState = {
    columnVisibility: {},
    density: 'comfortable',
    isFullScreen: false
}

export const useTableState = (tableId: string) => {
    const [tableState, setTableState] = useState<TableState>(() => {
        if (typeof window === 'undefined') return DEFAULT_TABLE_STATE

        const savedState = localStorage.getItem(`tableState_${tableId}`)
        return savedState ? JSON.parse(savedState) : DEFAULT_TABLE_STATE
    })

    useEffect(() => {
        localStorage.setItem(`tableState_${tableId}`, JSON.stringify(tableState))
    }, [tableState, tableId])

    const updateColumnVisibility = (updater: MRT_VisibilityState | ((old: MRT_VisibilityState) => MRT_VisibilityState)) => {
        setTableState(prev => ({
            ...prev,
            columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : updater
        }))
    }

    const updateDensity = (updater: MRT_DensityState | ((old: MRT_DensityState) => MRT_DensityState)) => {
        setTableState(prev => ({
            ...prev,
            density: typeof updater === 'function' ? updater(prev.density) : updater
        }))
    }

    const updateFullScreen = (updater: boolean | ((old: boolean) => boolean)) => {
        setTableState(prev => ({
            ...prev,
            isFullScreen: typeof updater === 'function' ? updater(prev.isFullScreen) : updater
        }))
    }

    return {
        tableState,
        updateColumnVisibility,
        updateDensity,
        updateFullScreen
    }
} 
