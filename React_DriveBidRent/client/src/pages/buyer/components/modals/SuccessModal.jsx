export default function SuccessModal({ isOpen, onRedirect, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content success-modal">
        <div className="success-icon">✓</div>
        <h2>Success!</h2>
        <p>{message}</p>
        <button className="btn btn-primary" onClick={onRedirect}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}