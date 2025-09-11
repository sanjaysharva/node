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
              <Link href="/" className="flex items-center space-x-2 group" data-testid="link-home">
                <div className="relative">
                  <i className="fab fa-discord text-3xl text-primary transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)]"></i>
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
                <span className="font-bold text-xl text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text animate-gradient-x bg-300% transition-all duration-300 group-hover:scale-105">
                  Smart Serve
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
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home">
              <div className="relative">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/50">
                  <div className="grid grid-cols-7 gap-0.5 w-6 h-6">
                    {Array.from({length: 49}).map((_, i) => {
                      const row = Math.floor(i / 7);
                      const col = i % 7;
                      const distance = Math.sqrt((row - 3)**2 + (col - 3)**2);
                      const opacity = distance <= 3 ? Math.max(0.2, 1 - (distance / 3) * 0.8) : 0;
                      return (
                        <div
                          key={i}
                          className="w-0.5 h-0.5 bg-white rounded-full transition-all duration-300"
                          style={{ opacity }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
              <span className="font-bold text-xl text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text animate-gradient-x bg-300% transition-all duration-300 group-hover:scale-105">
                Smart Serve
              </span>
            </Link>
            <div className="hidden md:flex space-x-6 items-center">
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
              <Link
                href="/join-members"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/join-members" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-join-members"
              >
                Join Members
              </Link>
              <Link
                href="/store"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/store" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-store"
              >
                Store
              </Link>
              <Link
                href="/quest"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/quest" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-quest"
              >
                Quest
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
                  {/* Categories inside dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="w-full px-2 py-1.5 text-sm outline-none cursor-pointer focus:bg-accent focus:text-accent-foreground">
                      <div className="flex items-center">
                        <i className="fas fa-sitemap mr-2 h-4 w-4 text-blue-400"></i>
                        Categories
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-sm border border-blue-400/20 ml-2">
                      <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-support">
                        <i className="fas fa-question-circle mr-2 h-4 w-4 text-blue-400"></i>
                        Support
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-feedback">
                        <i className="fas fa-comment mr-2 h-4 w-4 text-green-400"></i>
                        Feedback
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-submit-ticket">
                        <i className="fas fa-ticket-alt mr-2 h-4 w-4 text-green-400"></i>
                        Submit Ticket
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-blue-400/20" />
                      <DropdownMenuItem className="focus:bg-primary/20" data-testid="button-discord-menu">
                        <i className="fab fa-discord mr-2 h-4 w-4 text-primary"></i>
                        Discord
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 bg-secondary/20 hover:bg-secondary/30 transition-all duration-300 hover:scale-105"
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
                  <i className="fas fa-chevron-down text-sm transition-all duration-300 group-hover:text-primary"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="button-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/your-servers" data-testid="button-your-servers">
                    <Server className="mr-2 h-4 w-4" />
                    Your Servers
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
                {user?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
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
              className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
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