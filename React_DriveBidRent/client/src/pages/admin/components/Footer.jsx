import React from "react";

const Footer = () => {
  return (
    <footer style={{ background: "linear-gradient(135deg, #ff6b00, #ff9a44)", padding: "2rem", color: "white", marginTop: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", gap: "2rem" }}>
        <div>
          <h3>Quick Links</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><a href="/admin/admin" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</a></li>
            <li><a href="/admin/manage-user" style={{ color: "#fff", textDecoration: "none" }}>Manage Users</a></li>
            <li><a href="/admin/manage-earnings" style={{ color: "#fff", textDecoration: "none" }}>Manage Earnings</a></li>
            <li><a href="/admin/analytics" style={{ color: "#fff", textDecoration: "none" }}>Analytics</a></li>
          </ul>
        </div>
        <div>
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:jeevanvankadara@gmail.com" style={{ color: "#fff" }}>jeevanvankadara@gmail.com</a></p>
          <p>Phone: <a href="tel:9876543210" style={{ color: "#fff" }}>9876543210</a></p>
          <p>Address: sb-2, sagar colony, hyderabad</p>
        </div>
        <div>
          <h3>Follow Us</h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="#"><img src="/photos/instagram.png" alt="Instagram" style={{ width: 30, height: 30 }} /></a>
            <a href="#"><img src="/photos/facebook.png" alt="Facebook" style={{ width: 30, height: 30 }} /></a>
            <a href="#"><img src="/photos/X.png" alt="X" style={{ width: 30, height: 30 }} /></a>
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
        © 2025 DriveBidRent | All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;