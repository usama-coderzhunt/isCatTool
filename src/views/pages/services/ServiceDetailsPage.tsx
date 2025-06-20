import { Button, Card, Typography, Box, Divider, Chip } from '@mui/material'
import { ServiceTypes } from '@/types/services'
import { ServicePlanTypes } from '@/types/servicesPlans'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ServiceDetailsPageProps {
    service: ServiceTypes
    plan: ServicePlanTypes
}

const ServiceDetailsPage: React.FC<ServiceDetailsPageProps> = ({ service, plan }) => {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <Typography variant="h3" className="text-4xl font-bold text-gray-900 mb-4">
                        Thank You for Your Purchase!
                    </Typography>
                    <Typography variant="body1" className="text-lg text-gray-600">
                        You've successfully purchased {service.name} - {plan.name}
                    </Typography>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Service Details */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 rounded-2xl shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                                    <Image
                                        src={service.image}
                                        alt={service.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <Typography variant="h5" className="text-2xl font-bold text-gray-900 mb-2">
                                        {service.name}
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-600 mb-4">
                                        {service.description}
                                    </Typography>
                                    <Chip
                                        label={plan.name}
                                        color="primary"
                                        className="font-semibold"
                                    />
                                </div>
                            </div>

                            <Divider className="my-8" />

                            {/* Features Section */}
                            <div>
                                <Typography variant="h6" className="text-xl font-semibold text-gray-900 mb-6">
                                    Your Plan Features
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(plan.features).map(([key, value]) => (
                                        <div key={key} className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full ${value ? 'bg-green-100' : 'bg-red-100'}`}>
                                                <i className={`tabler-${value ? 'check' : 'x'} text-lg ${value ? 'text-green-600' : 'text-red-600'}`} />
                                            </div>
                                            <div>
                                                <Typography variant="body1" className="font-medium text-gray-900">
                                                    {service.features_list[key]}
                                                </Typography>
                                                <Typography variant="body2" className="text-gray-500">
                                                    {value ? 'Included' : 'Not Included'}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 rounded-2xl shadow-lg">
                            <Typography variant="h6" className="text-xl font-semibold text-gray-900 mb-4">
                                Order Summary
                            </Typography>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Typography variant="body1" className="text-gray-600">
                                        Plan
                                    </Typography>
                                    <Typography variant="body1" className="font-medium">
                                        {plan.name}
                                    </Typography>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Typography variant="body1" className="text-gray-600">
                                        Amount
                                    </Typography>
                                    <Typography variant="h6" className="text-primary font-bold">
                                        ${plan.price}
                                    </Typography>
                                </div>
                                <Divider className="my-4" />
                                <div className="flex justify-between items-center">
                                    <Typography variant="body1" className="font-medium">
                                        Total
                                    </Typography>
                                    <Typography variant="h5" className="text-primary font-bold">
                                        ${plan.price}
                                    </Typography>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Continue Button */}
                <div className="mt-12 text-center">
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        className="px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
                        onClick={() => router.push('/apps/dashboard')}
                    >
                        Continue to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ServiceDetailsPage 
