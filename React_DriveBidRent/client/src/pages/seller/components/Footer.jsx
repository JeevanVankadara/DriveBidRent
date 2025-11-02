import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <style>{`
        /* Footer */
        footer {
          margin-top: 80px;
          color: white;
          padding: 30px 10px;
          text-align: center;
          border-top: 3px solid #ff6b00;
          background-color: #333333;
        }
        
        .footerbox {
          display: flex;
          justify-content: space-evenly;
          flex-wrap: wrap;
          padding: 20px;
        }
        
        .footercontainer {
          width: 30%;
          min-width: 250px;
          text-align: left;
          padding: 10px;
        }
        
        .footercontainer h3 {
          border-bottom: 3px solid #ff6b00;
          display: inline-block;
          padding-bottom: 5px;
          margin-bottom: 15px;
          color: white;
        }
        
        .footercontainer ul {
          list-style: none;
          padding: 0;
        }
        
        .footercontainer ul li {
          margin: 8px 0;
        }
        
        .footercontainer ul li a {
          color: white;
          text-decoration: none;
          transition: 0.3s;
        }
        
        .footercontainer ul li a:hover {
          color: #ff6b00;
          text-decoration: underline;
        }
        
        .footercontainer p {
          margin: 8px 0;
        }
        
        .footercontainer a {
          color: white;
          text-decoration: none;
        }
        
        .footercontainer a:hover {
          color: #ff6b00;
        }
        
        .soc-med-img {
          width: 35px;
          height: auto;
          margin: 0 8px;
          transition: transform 0.3s ease-in-out;
        }
        
        .soc-med-img:hover {
          transform: scale(1.2);
        }
        
        .social-icons {
          display: flex;
          gap: 15px;
          justify-content: left;
          margin-top: 10px;
        }
        
        .footer-copy {
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .footerbox {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .footercontainer {
            width: 100%;
            text-align: center;
          }
          
          .social-icons {
            justify-content: center;
          }
        }
      `}</style>
      <footer>
        <div className="footerbox">
          <div className="footercontainer">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/seller_dashboard/seller">Dashboard</Link></li>
              <li><Link to="/seller_dashboard/add-auction">Add Auction</Link></li>
              <li><Link to="/seller_dashboard/add-rental">Add Rental</Link></li>
              <li><Link to="/seller_dashboard/view-earnings">Earnings</Link></li>
            </ul>
          </div>
          <div className="footercontainer">
            <h3>Contact Us</h3>
            <p>
              <strong>Email:</strong>
              <a href="mailto:jeevanvankadara@gmail.com">jeevanvankadara@gmail.com</a>
            </p>
            <p><strong>Phone:</strong> <a href="tel:9876543210">9876543210</a></p>
            <p><strong>Address:</strong> sb-2, sagar colony, hyderabad</p>
          </div>
          <div className="footercontainer">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#instagram">
                <img src="/css/photos/instagram.png" alt="Instagram" className="soc-med-img" />
              </a>
              <a href="#facebook">
                <img src="/css/photos/facebook.png" alt="Facebook" className="soc-med-img" />
              </a>
              <a href="#twitter">
                <img src="/css/photos/X.png" alt="X" className="soc-med-img" />
              </a>
            </div>
          </div>
        </div>
        <p className="footer-copy">© 2025 DriveBidRent | All rights reserved.</p>
      </footer>
    </>
  );
};

export default Footer;