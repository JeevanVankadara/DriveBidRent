// client/src/pages/mechanic/components/MechanicFooter.jsx
export default function MechanicFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-4 border-orange-600 inline-block pb-2">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-orange-500 transition">Home</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">About</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-4 border-orange-600 inline-block pb-2">Contact</h3>
            <p className="text-gray-300">Email: support@drivebidrent.com</p>
            <p className="text-gray-300">Phone: +91 98765 432 100</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-4 border-orange-600 inline-block pb-2">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:opacity-80"><img src="/instagram.png" alt="IG" className="w-8 h-8" /></a>
              <a href="#" className="hover:opacity-80"><img src="/facebook.png" alt="FB" className="w-8 h-8" /></a>
            </div>
          </div>
        </div>
        <div className="text-center mt-10 pt-6 border-t border-gray-700 text-gray-400">
          © 2025 DriveBidRent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}