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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Complete Payment</h2>
        
        <div className="payment-amount">
          <h3>Total Amount: ₹{totalCost}</h3>
        </div>

        <div className="payment-methods">
          <h4>Select Payment Method</h4>
          <div className="payment-options">
            <div 
              className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('upi')}
            >
              <div className="payment-icon">UPI</div>
              <div className="payment-info">
                <h4>Pay with UPI</h4>
                <p>Instant payment using any UPI app</p>
              </div>
            </div>

            <div 
              className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('card')}
            >
              <div className="payment-icon">💳</div>
              <div className="payment-info">
                <h4>Credit/Debit Card</h4>
                <p>Pay using your card</p>
              </div>
            </div>

            <div 
              className={`payment-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('netbanking')}
            >
              <div className="payment-icon">🏦</div>
              <div className="payment-info">
                <h4>Net Banking</h4>
                <p>Pay using net banking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePayment}>
            Pay ₹{totalCost}
          </button>
        </div>
      </div>
    </div>
  );
}