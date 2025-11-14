export default function ProcessingModal({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <div className="payment-processing">
          <div className="spinner"></div>
          <h3>Processing Payment</h3>
          <p>Please wait while we process your payment...</p>
        </div>
      </div>
    </div>
  );
}