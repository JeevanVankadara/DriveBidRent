// client/src/components/hub/HubFooter.jsx
// The one footer every dashboard renders. Styling lives in styles/HubTheme.css.
import '../../styles/HubTheme.css';

export default function HubFooter() {
  return (
    <footer className="hub-footer">
      <p className="hub-footer-title">DriveBidRent</p>
      <p className="hub-footer-note">
        © {new Date().getFullYear()} DriveBidRent. All rights reserved.
      </p>
    </footer>
  );
}
