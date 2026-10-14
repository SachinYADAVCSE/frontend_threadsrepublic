import { Link, useSearchParams } from "react-router-dom";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();

  const orderNumber =
    searchParams.get("order");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-2xl">
          ×
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          Payment Failed
        </h1>

        <p className="mt-3 text-gray-600">
          We couldn't complete your payment.
          Please try again.
        </p>

        {orderNumber && (
          <p className="mt-4 text-sm text-gray-500">
            Order: {orderNumber}
          </p>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/checkout"
            className="bg-black px-6 py-3 text-white"
          >
            Try Again
          </Link>

          <Link
            to="/shop"
            className="border px-6 py-3"
          >
            Shop
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PaymentFailed;