import { notFound } from 'next/navigation';
import CustomerPaymentForm from './CustomerPaymentForm';

// This is a public page that doesn't require authentication
export default async function CustomerPaymentPage({
  params
}: {
  params: { customerId: string; businessId: string };
}) {
  const { customerId, businessId } = params;

  // Validate that the customer and business exist
  // This is where you would fetch any necessary data from your backend
  // If either doesn't exist, return a 404
  try {
    // Example fetch (replace with your actual API call)
    // const customer = await fetchCustomer(customerId, businessId);
    // const business = await fetchBusiness(businessId);

    // if (!customer || !business) {
    //   return notFound();
    // }

    // You could pass additional data to the form if needed
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Complete Your Payment
            </h1>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Please provide your payment information below
            </p>
          </div>

          <CustomerPaymentForm
            customerId={customerId}
            businessId={businessId}
          />

          <div className="mt-10 text-center">
            <div className="flex justify-center space-x-6">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-sm text-gray-500">Secure Payment</span>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-sm text-gray-500">Fast & Safe</span>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-gray-500">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading payment page:', error);
    return notFound();
  }
}
