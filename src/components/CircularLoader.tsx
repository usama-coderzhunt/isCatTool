'use client'

import { CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'

interface CircularLoaderProps {
    size?: number
    className?: string
}

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.primary.main,
    '& .MuiCircularProgress-circle': {
        strokeLinecap: 'round'
    }
}))

const CircularLoader = ({ size = 40, className }: CircularLoaderProps) => {
    return (
        <div className={`w-full h-full flex items-center justify-center ${className || ''}`}>
            <StyledCircularProgress size={size} />
        </div>
    )
}

export default CircularLoader 
