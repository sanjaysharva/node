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
} from "@/components/ui/dropdown-menu";
import { User, Settings, Plus, LogOut, Server, Bot } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
                <i className="fab fa-discord text-3xl text-primary"></i>
                <span className="font-bold text-xl text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">Smart Serve</span>
              </Link>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <i className="fab fa-discord text-3xl text-primary"></i>
              <span className="font-bold text-xl">DiscordHub</span>
            </Link>
            <div className="hidden md:flex space-x-6 items-center">
              <Link
                href="/categories"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/categories" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-categories"
              >
                Categories
              </Link>
              <Link
                href="/advertise"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/advertise" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-advertise"
              >
                Advertise
              </Link>
              <Link
                href="/explore"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/explore" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-explore"
              >
                Explore
              </Link>
              <Link
                href="/events"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/events" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-events"
              >
                Events
              </Link>
              
              {/* Three dots dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]"
                    data-testid="button-menu-dots"
                  >
                    <i className="fas fa-ellipsis-h"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm border border-purple-400/20">
                  <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-premium">
                    <i className="fas fa-crown mr-2 h-4 w-4 text-yellow-500"></i>
                    Premium
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-purple-400/20" />
                  <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-feedback">
                    <i className="fas fa-comment mr-2 h-4 w-4 text-blue-400"></i>
                    Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-submit-ticket">
                    <i className="fas fa-ticket-alt mr-2 h-4 w-4 text-green-400"></i>
                    Submit Ticket
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-purple-400/20" />
                  <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-discord-menu">
                    <i className="fab fa-discord mr-2 h-4 w-4 text-primary"></i>
                    Discord
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 bg-secondary/20 hover:bg-secondary/30"
                  data-testid="button-user-menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined}
                      alt="User Avatar"
                    />
                    <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span data-testid="text-username">{user?.username}</span>
                  <i className="fas fa-chevron-down text-sm"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="button-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/add-server" data-testid="button-add-server">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Server
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/add-bot" data-testid="button-add-bot">
                    <Bot className="mr-2 h-4 w-4" />
                    Add Bot
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="button-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-400 focus:text-red-400"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={loginWithDiscord}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-login"
            >
              <i className="fab fa-discord mr-2"></i>
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
