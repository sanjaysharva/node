
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, loginWithDiscord, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { User, Server, Trophy, ShoppingCart, LogOut, Bot, Calendar, Plus, Users, Hash, Settings, Coins, ChevronDown, HelpCircle, Mail, Ticket } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);

  const handleLogin = () => {
    loginWithDiscord(false);
  };

  if (isLoading) {
    return (
      <nav className="bg-[#1a1a2e] border-b border-[#16213e] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home">
                <div className="relative">
                  <img 
                    src="/assets/axiom-logo.png" 
                    alt="Axiom Logo" 
                    className="w-10 h-10 object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)]"
                    onError={(e) => {
                      console.error('Logo failed to load:', e);
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
                <span className="font-bold text-xl text-white bg-300% transition-all duration-300 group-hover:scale-105">
                  Axiom
                </span>
              </Link>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#1a1a2e] border-b border-[#16213e] sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home">
              <div className="relative">
                <img 
                  src="/assets/axiom-logo.png" 
                  alt="Axiom Logo" 
                  className="w-10 h-10 object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)]"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'block';
                  }}
                />
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
              <span className="font-bold text-xl text-white bg-300% transition-all duration-300 group-hover:scale-105">
                Axiom
              </span>
            </Link>
          </div>

          {/* Centered Navigation Links */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-8">
              <Link
                href="/explore"
                className={`text-white hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/explore" ? "text-purple-400" : ""
                }`}
                data-testid="link-explore"
              >
                Explore
              </Link>

              {/* Service Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setServiceDropdownOpen(true)}
                onMouseLeave={() => setServiceDropdownOpen(false)}
              >
                <button 
                  className="flex items-center text-white hover:text-purple-400 transition-colors duration-200" 
                  data-testid="dropdown-service"
                >
                  <Server className="w-4 h-4 mr-1" />
                  Service
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                
                {serviceDropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-[#1a1a2e] rounded-xl shadow-2xl border border-[#16213e] py-2 z-50">
                    <Link href="/advertise-server" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-advertise-server">
                      <Server className="w-4 h-4 mr-3 text-purple-400" />
                      Advertise Server
                    </Link>
                    <Link href="/add-bot" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-advertise-bot">
                      <Bot className="w-4 h-4 mr-3 text-purple-400" />
                      Advertise Bot
                    </Link>
                    <Link href="/add-event" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-advertise-event">
                      <Calendar className="w-4 h-4 mr-3 text-purple-400" />
                      Advertise Event
                    </Link>
                    <Link href="/partnership" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-partnership">
                      <Users className="w-4 h-4 mr-3 text-purple-400" />
                      Partnership
                    </Link>
                    <Link href="/server-templates" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-template">
                      <Hash className="w-4 h-4 mr-3 text-purple-400" />
                      Template
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/join-members"
                className={`text-white hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/join-members" ? "text-purple-400" : ""
                }`}
                data-testid="link-join-members"
              >
                Join Member
              </Link>

              <Link
                href="/store"
                className={`text-white hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/store" ? "text-purple-400" : ""
                }`}
                data-testid="link-store"
              >
                Store
              </Link>

              <Link
                href="/jobs"
                className={`text-white hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/jobs" ? "text-purple-400" : ""
                }`}
                data-testid="link-jobs"
              >
                Job
              </Link>

              {/* Support Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setSupportDropdownOpen(true)}
                onMouseLeave={() => setSupportDropdownOpen(false)}
              >
                <button 
                  className="flex items-center text-white hover:text-purple-400 transition-colors duration-200" 
                  data-testid="dropdown-support"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Support
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                
                {supportDropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-[#1a1a2e] rounded-xl shadow-2xl border border-[#16213e] py-2 z-50 right-0">
                    <Link href="/help" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-help">
                      <HelpCircle className="w-4 h-4 mr-3 text-purple-400" />
                      Help
                    </Link>
                    <Link href="/contact-us" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-contact-us">
                      <Mail className="w-4 h-4 mr-3 text-purple-400" />
                      Contact Us
                    </Link>
                    <Link href="/support-ticket" className="flex items-center px-4 py-3 text-white hover:bg-[#16213e] transition-colors" data-testid="link-support-ticket">
                      <Ticket className="w-4 h-4 mr-3 text-purple-400" />
                      Support Ticket
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Login/Profile Section */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 bg-[#16213e] hover:bg-[#0f172a] transition-all duration-300 hover:scale-105 text-white"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined}
                        alt="User Avatar"
                      />
                      <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span data-testid="text-displayname">{user?.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount className="w-56 bg-[#1a1a2e] border-[#16213e]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.username}</p>
                      <p className="text-xs leading-none text-gray-400">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Coins className="w-3 h-3" />
                        <span>{user?.coins || 0} coins</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#16213e]" />
                  <DropdownMenuItem asChild className="text-white hover:bg-[#16213e]">
                    <Link href="/profile" data-testid="button-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-[#16213e]">
                    <Link href="/your-servers" data-testid="button-your-servers">
                      <Server className="mr-2 h-4 w-4" />
                      Your Servers
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-[#16213e]">
                    <Link href="/quest" data-testid="button-quest">
                      <Trophy className="mr-2 h-4 w-4" />
                      Quest
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild className="text-white hover:bg-[#16213e]">
                      <Link href="/admin" data-testid="button-admin-panel">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#16213e]" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 focus:text-red-400 hover:bg-[#16213e]"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                data-testid="button-login"
              >
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
