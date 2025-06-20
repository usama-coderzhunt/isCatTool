'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ServiceDetailsPage from '@/views/pages/services/ServiceDetailsPage'
import { useOrdersHooks } from '@/services/useOrdersHooks'
import { CircularProgress, Box } from '@mui/material'

const ServiceDetails = () => {
    const params = useParams()
    const orderId = params.orderId as string
    const { getOrderById } = useOrdersHooks()
    const { data: orderData, isLoading } = getOrderById(parseInt(orderId))

    if (isLoading) {
        return (
            <Box className="min-h-screen flex items-center justify-center">
                <CircularProgress />
            </Box>
        )
    }

    if (!orderData?.data) {
        return null
    }

    const { service, plan } = orderData.data

    return <ServiceDetailsPage service={service} plan={plan} />
}

export default ServiceDetails 
