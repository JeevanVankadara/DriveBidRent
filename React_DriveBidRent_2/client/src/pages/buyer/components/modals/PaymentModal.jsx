import { useState } from 'react';

export default function PaymentModal({
  isOpen,
  onClose,
  onProcessPayment,
  totalCost,
  selectedPaymentMethod,
  onPaymentMethodSelect
}) {
  const [paymentMethod, setPaymentMethod] = useState(selectedPaymentMethod || 'upi');

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    onPaymentMethodSelect(method);
  };

  const handlePayment = () => {
    onProcessPayment(paymentMethod);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-white">
          <h2 className="text-4xl font-bold">Complete Payment</h2>
          <p className="text-orange-100 mt-2">Select your payment method</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Total Amount */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 mb-8">
            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Total Amount Due</p>
            <h3 className="text-4xl font-bold text-blue-600 mt-2">₹{totalCost.toLocaleString()}</h3>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="inline-block w-1 h-6 bg-orange-500 rounded mr-3"></span>
              Select Payment Method
            </h4>
            <div className="space-y-4">
              {/* UPI Option */}
              <div
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${paymentMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                onClick={() => handlePaymentMethodSelect('upi')}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">📱</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">Pay with UPI</h4>
                    <p className="text-gray-600 text-sm mt-1">Instant payment using any UPI app</p>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="text-orange-500 text-3xl">✓</div>
                  )}
                </div>
              </div>

              {/* Card Option */}
              <div
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                onClick={() => handlePaymentMethodSelect('card')}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">💳</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">Credit/Debit Card</h4>
                    <p className="text-gray-600 text-sm mt-1">Pay using your card</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="text-orange-500 text-3xl">✓</div>
                  )}
                </div>
              </div>

              {/* Net Banking Option */}
              <div
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${paymentMethod === 'netbanking'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                onClick={() => handlePaymentMethodSelect('netbanking')}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">🏦</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">Net Banking</h4>
                    <p className="text-gray-600 text-sm mt-1">Pay using net banking</p>
                  </div>
                  {paymentMethod === 'netbanking' && (
                    <div className="text-orange-500 text-3xl">✓</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition transform hover:scale-105 active:scale-95"
          >
            Pay ₹{totalCost.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}