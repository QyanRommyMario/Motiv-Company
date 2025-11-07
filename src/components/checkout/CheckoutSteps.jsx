"use client";

/**
 * CheckoutSteps Component
 * Visual stepper for checkout process
 */

export default function CheckoutSteps({ currentStep }) {
  const steps = [
    { number: 1, title: "Keranjang", path: "/cart" },
    { number: 2, title: "Alamat Pengiriman", path: "/checkout" },
    { number: 3, title: "Pembayaran", path: "/checkout/payment" },
    { number: 4, title: "Selesai", path: "/checkout/success" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                  currentStep >= step.number
                    ? "bg-gray-900 border-gray-900 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <span
                className={`text-xs mt-2 text-center ${
                  currentStep >= step.number
                    ? "text-gray-900 font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > step.number ? "bg-gray-900" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
