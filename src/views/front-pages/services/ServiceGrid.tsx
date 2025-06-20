import { ServiceTypes } from '@/types/services'
import React from 'react'
import ServiceCard from './ServiceCard'

interface ServicesGridProps {
  services: ServiceTypes[]
}

const ServiceGrid: React.FC<ServicesGridProps> = ({ services }) => {
  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {services?.map((service, index) => <ServiceCard service={service} key={service.id || index} />)}
    </div>
  )
}

export default ServiceGrid
