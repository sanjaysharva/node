import { Link } from "wouter";

export default function Footer() {
  return (
    <div>
      {/* Purple division line between home page and footer */}
      <div className="h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-80 animate-pulse"></div>

      <footer className="text-white py-12 relative overflow-hidden" style={{
        background: 'linear-gradient(to bottom, #020617 50%, #1e40af 10%, #1d4ed8 20%, #2563eb 30%, #1e293b 50%, #0f172a 70%, #020617 85%, #000000 100%)',
      }}>
        {/* Enhanced space-like background pattern with more stars */}
        <div className="absolute inset-0 opacity-80">
          {/* Large bright stars */}
          <div className="absolute top-8 left-12 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></div>
          <div className="absolute top-16 right-24 w-1 h-1 bg-blue-100 rounded-full animate-pulse delay-300 shadow-md shadow-blue-100/30"></div>
          <div className="absolute top-24 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-700 shadow-sm shadow-white/40"></div>
          <div className="absolute top-32 right-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-500 shadow-lg shadow-blue-200/50"></div>
          <div className="absolute top-40 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-12 right-1/2 w-1 h-1 bg-blue-100 rounded-full animate-pulse delay-200"></div>
          
          {/* Medium stars */}
          <div className="absolute top-20 left-1/5 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-400"></div>
          <div className="absolute top-36 right-1/4 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse delay-600"></div>
          <div className="absolute top-28 left-2/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-800"></div>
          <div className="absolute top-44 right-1/5 w-0.5 h-0.5 bg-blue-100 rounded-full animate-pulse delay-100"></div>
          <div className="absolute top-14 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-900"></div>
          <div className="absolute top-38 right-3/5 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse delay-450"></div>
          
          {/* Small twinkling stars */}
          <div className="absolute top-10 left-1/4 w-px h-px bg-white rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-18 right-2/3 w-px h-px bg-blue-100 rounded-full animate-pulse delay-350"></div>
          <div className="absolute top-26 left-4/5 w-px h-px bg-white rounded-full animate-pulse delay-550"></div>
          <div className="absolute top-34 right-1/6 w-px h-px bg-blue-200 rounded-full animate-pulse delay-750"></div>
          <div className="absolute top-42 left-1/6 w-px h-px bg-white rounded-full animate-pulse delay-950"></div>
          <div className="absolute top-22 right-4/5 w-px h-px bg-blue-100 rounded-full animate-pulse delay-250"></div>
          <div className="absolute top-30 left-3/5 w-px h-px bg-white rounded-full animate-pulse delay-650"></div>
          <div className="absolute top-46 right-2/5 w-px h-px bg-blue-200 rounded-full animate-pulse delay-850"></div>
        </div>
        
        {/* Space nebula overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/15 via-transparent to-purple-900/10 opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Logo and Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/assets/axiom-logo.png" 
                  alt="Axiom Logo" 
                  className="w-12 h-12 rounded-full"
                  data-testid="img-axiom-logo"
                />
                <span className="text-white font-semibold text-lg">Axiom</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed ">
                We are a small hosting provider focused on providing the best service we can to our thousands of users.
              </p>
            </div>

          {/* Services */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-purple-400 to-transparent opacity-60"></div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              Services
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-purple-500 mt-1"></div>
            </h3>
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
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-purple-400 to-transparent opacity-60"></div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              About
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-purple-500 mt-1"></div>
            </h3>
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
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-purple-400 to-transparent opacity-60"></div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              Legal
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-purple-500 mt-1"></div>
            </h3>
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
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-purple-400 to-transparent opacity-60"></div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              Social
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-purple-500 mt-1"></div>
            </h3>
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
      </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-purple-500/30 text-center relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
          <p className="text-gray-400 text-sm mb-2">
            2022 - 2025 Silly Development
          </p>
          <p className="text-gray-400 text-sm">
            Made with ❤️ by Gamerz5r4
          </p>
        </div>
      </footer>
    </div>
  );
}