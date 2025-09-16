import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">SD</span>
              </div>
              <span className="text-white font-semibold text-lg">Silly Development</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              We are a small hosting provider focused on providing the best service we can to our thousands of users.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="/services/minecraft" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">⬛</span>
                  Minecraft
                </a>
              </li>
              <li>
                <a href="/services/discord-bots" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">🤖</span>
                  Discord Bots
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">➡️</span>
                  More Services
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">🏢</span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">🗺️</span>
                  Sitemap
                </a>
              </li>
              <li>
                <a href="/status" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">📊</span>
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">🔒</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">⚖️</span>
                  Terms Of Service
                </a>
              </li>
              <li>
                <a href="/fair-use" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">⚖️</span>
                  Fair Use Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Social</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://discord.gg/sillydev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">💬</span>
                  Discord
                </a>
              </li>
              <li>
                <a href="https://github.com/Silly-Development" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">🐙</span>
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com/sillydevelop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center">
                  <span className="mr-2">🐦</span>
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-2">
            2022 - 2025 Silly Development
          </p>
          <p className="text-gray-400 text-sm">
            Made with ❤️ by Gamerz5r4
          </p>
        </div>
      </div>
    </footer>
  );
}