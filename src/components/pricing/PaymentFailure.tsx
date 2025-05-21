import React from 'react';
import { useRouter } from 'next/navigation'

const PaymentFailure = () => {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push('/apps/orders');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#F9FAFB'
    }}>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center" style={{
        width: '100%',
        maxWidth: '28rem',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        margin: 'auto'
      }}>
        <div className="mb-8" style={{ marginBottom: '2rem' }}>
          <svg className="w-20 h-20 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '5rem', height: '5rem', margin: '0 auto', color: '#EF4444' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '1rem' }}>
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-4" style={{ color: '#4B5563', marginBottom: '1rem' }}>
          We're sorry, but your payment could not be processed. Please try again or contact support if the problem persists.
        </p>

        <button
          onClick={handleTryAgain}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200"
          style={{
            width: '100%',
            backgroundColor: '#4F46E5',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
          }}
        >
          Go to Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure; 
