// client/src/pages/buyer/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/buyer/purchases" className="hover:text-orange-400 transition">My Purchases</Link></li>
              <li><Link to="/buyer/wishlist" className="hover:text-orange-400 transition">Wishlist</Link></li>
              <li><Link to="/buyer/my-bids" className="hover:text-orange-400 transition">My Bids</Link></li>
              <li><Link to="/buyer/notifications" className="hover:text-orange-400 transition">Notifications</Link></li>
              <li><Link to="/buyer/about" className="hover:text-orange-400 transition">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-5">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-orange-400">Email:</strong><br />
                <a href="mailto:jeevanvankadara@gmail.com" className="hover:text-orange-400 transition">
                  jeevanvankadara@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-orange-400">Phone:</strong><br />
                <a href="tel:9876543210" className="hover:text-orange-400 transition">9876543210</a>
              </p>
              <p>
                <strong className="text-orange-400">Address:</strong><br />
                SB-2, Sagar Colony, Hyderabad, India
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-5">Follow Us</h3>
            <div className="flex space-x-6">
              <a href="#" className="hover:scale-110 transition transform">
                <img src="/css/photos/instagram.png" alt="Instagram" className="w-10 h-10" />
              </a>
              <a href="#" className="hover:scale-110 transition transform">
                <img src="/css/photos/facebook.png" alt="Facebook" className="w-10 h-10" />
              </a>
              <a href="#" className="hover:scale-110 transition transform">
                <img src="/css/photos/X.png" alt="X" className="w-10 h-10" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
          <p>&copy; 2025 <span className="text-orange-500 font-bold">DriveBidRent</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}