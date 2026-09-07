// client/src/pages/buyer/components/Footer.jsx
// Hub-styled footer for the buyer section only.
// The shared pages/components/Footer.jsx is left untouched because
// admin, seller, mechanic, auctionManager and auth pages all use it.
export default function Footer() {
  return (
    <footer className="hub-footer">
      <p className="hub-footer-title">DriveBidRent</p>
      <p className="hub-footer-note">© 2026 DriveBidRent. All rights reserved.</p>
    </footer>
  );
}
