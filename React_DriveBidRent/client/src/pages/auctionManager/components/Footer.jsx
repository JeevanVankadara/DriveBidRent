// client/src/pages/auctionManager/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-orange-500 to-orange-400 text-white py-12 mt-16 font-montserrat">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-around gap-8 px-4">
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/auction-manager/requests" className="hover:text-gray-200">Requests</Link></li>
            <li><Link to="/auction-manager/pending" className="hover:text-gray-200">Pending cars</Link></li>
            <li><Link to="/auction-manager/approved" className="hover:text-gray-200">Approved cars</Link></li>
            <li><a href="#" className="hover:text-gray-200">About Us</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p><strong>Email:</strong> <a href="mailto:jeevanvankadara@gmail.com" className="hover:text-gray-200">jeevanvankadara@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:9876543210" className="hover:text-gray-200">9876543210</a></p>
          <p><strong>Address:</strong> sb-2, sagar colony, hyderabad</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#"><img src="/css/photos/instagram.png" alt="Instagram" className="w-8 h-8 filter brightness-0 invert hover:scale-125 transition" /></a>
            <a href="#"><img src="/css/photos/facebook.png" alt="Facebook" className="w-8 h-8 filter brightness-0 invert hover:scale-125 transition" /></a>
            <a href="#"><img src="/css/photos/X.png" alt="X" className="w-8 h-8 filter brightness-0 invert hover:scale-125 transition" /></a>
          </div>
        </div>
      </div>
      <p className="text-center mt-8 pt-6 border-t border-white border-opacity-30">© 2025 DriveBidRent | All rights reserved.</p>
    </footer>
  );
}