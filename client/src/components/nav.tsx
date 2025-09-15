
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Server, Bot, Calendar, Handshake, FileText, Search, Users, ShoppingCart, Briefcase, HelpCircle, Mail, Ticket, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Nav() {
  const [location] = useLocation();
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group" data-testid="link-home">
              <div className="relative">
                <img 
                  src="/assets/axiom-logo.png" 
                  width="45"
                  height="45"
                  alt="Axiom Logo" 
                  className="object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)]"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'block';
                  }}
                />
                <div className="absolute inset-0 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
              <span className="font-bold text-xl text-white bg-300% transition-all duration-300 group-hover:scale-105 ml-2">
                Axiom
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {/* Explore */}
            <Link 
              href="/explore" 
              className="flex items-center text-white hover:text-purple-400 transition-colors duration-200"
              data-testid="link-explore"
            >
              <Search className="w-4 h-4 mr-1" />
              Explore
            </Link>

            {/* Service Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setServiceDropdownOpen(true)}
              onMouseLeave={() => setServiceDropdownOpen(false)}
            >
              <button className="flex items-center text-white hover:text-purple-400 transition-colors duration-200" data-testid="dropdown-service">
                <Server className="w-4 h-4 mr-1" />
                Service
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {serviceDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                  <Link href="/advertise-server" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-advertise-server">
                    <Server className="w-4 h-4 mr-3" />
                    Advertise Server
                  </Link>
                  <Link href="/add-bot" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-advertise-bot">
                    <Bot className="w-4 h-4 mr-3" />
                    Advertise Bot
                  </Link>
                  <Link href="/add-event" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-advertise-event">
                    <Calendar className="w-4 h-4 mr-3" />
                    Advertise Event
                  </Link>
                  <Link href="/partnership" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-partnership">
                    <Handshake className="w-4 h-4 mr-3" />
                    Partnership
                  </Link>
                  <Link href="/server-templates" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-template">
                    <FileText className="w-4 h-4 mr-3" />
                    Template
                  </Link>
                </div>
              )}
            </div>

            {/* Join Member */}
            <Link 
              href="/join-members" 
              className="flex items-center text-white hover:text-purple-400 transition-colors duration-200"
              data-testid="link-join-members"
            >
              <Users className="w-4 h-4 mr-1" />
              Join Member
            </Link>

            {/* Store */}
            <Link 
              href="/store" 
              className="flex items-center text-white hover:text-purple-400 transition-colors duration-200"
              data-testid="link-store"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Store
            </Link>

            {/* Job */}
            <Link 
              href="/jobs" 
              className="flex items-center text-white hover:text-purple-400 transition-colors duration-200"
              data-testid="link-jobs"
            >
              <Briefcase className="w-4 h-4 mr-1" />
              Job
            </Link>

            {/* Support Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setSupportDropdownOpen(true)}
              onMouseLeave={() => setSupportDropdownOpen(false)}
            >
              <button className="flex items-center text-white hover:text-purple-400 transition-colors duration-200" data-testid="dropdown-support">
                <HelpCircle className="w-4 h-4 mr-1" />
                Support
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {supportDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50 right-0">
                  <Link href="/help" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-help">
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help
                  </Link>
                  <Link href="/contact-us" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-contact-us">
                    <Mail className="w-4 h-4 mr-3" />
                    Contact Us
                  </Link>
                  <Link href="/support-ticket" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-support-ticket">
                    <Ticket className="w-4 h-4 mr-3" />
                    Support Ticket
                  </Link>
                  
                  <div className="border-t border-gray-600 my-2"></div>
                  
                  <div className="px-4 py-2">
                    <h4 className="text-gray-400 text-sm font-semibold mb-2">Social</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <a href="https://discord.gg/your-server" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-purple-400 transition-colors text-sm" data-testid="link-discord">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Discord
                      </a>
                      <a href="https://twitter.com/your-account" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-purple-400 transition-colors text-sm" data-testid="link-twitter">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                      <a href="https://facebook.com/your-page" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-purple-400 transition-colors text-sm" data-testid="link-facebook">
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </a>
                      <a href="https://instagram.com/your-account" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-purple-400 transition-colors text-sm" data-testid="link-instagram">
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                      <a href="https://youtube.com/your-channel" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-purple-400 transition-colors text-sm" data-testid="link-youtube">
                        <Youtube className="w-4 h-4 mr-2" />
                        Youtube
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
