
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] border-t border-[#16213e] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/axiom-logo.png" 
                width="40"
                height="40"
                alt="Axiom Logo" 
                className="object-contain rounded-lg"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.currentTarget.style.display = 'block';
                }}
              />
              <span className="font-bold text-lg text-white">Axiom</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              We are a small hosting provider focused on providing the best service we can to our thousands of users.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/advertise-server" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Discord Servers
                </Link>
              </li>
              <li>
                <Link 
                  href="/add-bot" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Discord Bots
                </Link>
              </li>
              <li>
                <Link 
                  href="/explore" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  More Services
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">About</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/help" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Sitemap
                </Link>
              </li>
              <li>
                <Link 
                  href="/status" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Terms Of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/fair-use" 
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Fair Use Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Social</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.gg/axiom" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/axiom" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/axiom" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#16213e] mt-8 pt-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">
              2022 - {new Date().getFullYear()} Axiom
            </p>
            <p className="text-gray-500 text-xs">
              Made with ❤️ by Axiom Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
