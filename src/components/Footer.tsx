import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#2D3436] text-white">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-[#60A5FA] via-[#A29BFE] to-[#60A5FA]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#60A5FA] rounded-lg mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h3 className="text-xl font-bold">BudEvent</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connect with friends and discover amazing events in your area. 
              From casual meetups to exciting activities, BudEvent makes it easy to stay connected.
            </p>
            <div className="flex space-x-4">
              {/* Add social media icons here when you have them */}
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm">📱</span>
              </div>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm">📧</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events/new" className="text-gray-300 hover:text-white transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/info/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support & Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/info/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/info/guidelines" className="text-gray-300 hover:text-white transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/info/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/info/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8">
          {/* Custom gradient line */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#60A5FA] to-transparent mb-8"></div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} BudEvent. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/info/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </Link>
              <Link href="/info/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                Help
              </Link>
              <Link href="/info/feedback" className="text-gray-400 hover:text-white text-sm transition-colors">
                Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
