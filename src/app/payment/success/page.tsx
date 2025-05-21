'use client'
import PaymentSuccess from "@/components/pricing/PaymentSuccess";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const PaymentSuccessPage = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PaymentSuccess />
    </QueryClientProvider>

  )
}

export default PaymentSuccessPage;
