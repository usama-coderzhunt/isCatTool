'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { useLawyerClientsHooks } from '@/services/lawyerClients'
import LawyerClientDetails from '@/views/pages/lawyer-client-and-leads-details/lawyerClientDetails'
import DocsListing from '@/views/pages/client-and-lead-details/docsListing'
import { useAuthStore } from '@/store/useAuthStore'
import CasesListings from '../../../apps/listings/casesListings/page'

const LawyerClientDetailsPage = () => {
    const userPermissions = useAuthStore(state => state.userPermissions)
    const params = useParams()
    const [clientId, setClientId] = useState<number>()
    const { getLawyerClientById } = useLawyerClientsHooks()

    useEffect(() => {
        setClientId(Number(params.id))
    }, [params.id])

    const { data: lawyerClientDetails, isLoading } = getLawyerClientById(Number(clientId))
    return (
        <div className='w-full flex flex-col gap-y-10'>
            {clientId && (
                <>
                    <LawyerClientDetails lawyerClientDetails={lawyerClientDetails} isLoading={isLoading} />
                    <DocsListing userPermissions={userPermissions} selectedClientData={lawyerClientDetails} />
                    <CasesListings clientId={clientId} />
                </>
            )}
        </div>
    )
}

export default LawyerClientDetailsPage
