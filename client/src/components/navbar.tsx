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
import { User, Server, Trophy, ShoppingCart, LogOut, Menu, Bot, Calendar, Plus, Users, Hash, Settings, Coins } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

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
                <span className="font-bold text-xl text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text animate-gradient-x bg-300% transition-all duration-300 group-hover:scale-105">
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
            <div className="hidden md:flex items-center space-x-8">
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
                href="/partnership"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/partnership" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-partnership"
              >
                Partnership
              </Link>
              <Link
                href="/server-templates"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/server-templates" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-server-templates"
              >
                Templates
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
              <Link
                href="/jobs"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/jobs" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-jobs"
              >
                Jobs
              </Link>
              <Link
                href="/help-center"
                className={`transition-all duration-300 hover:text-primary hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] ${
                  location === "/help-center" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-help-center"
              >
                Help
              </Link>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
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
                    <span data-testid="text-displayname">{user?.username}</span>
                    <i className="fas fa-chevron-down text-sm transition-all duration-300 group-hover:text-primary"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Coins className="w-3 h-3" />
                        <span>{user?.coins || 0} coins</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="button-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/add-event" data-testid="button-add-event">
                      <Calendar className="mr-2 h-4 w-4" />
                      Add Event
                    </Link>
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
                  <DropdownMenuItem onClick={() => navigate('/partnership')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Partnership Hub</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/server-templates')}>
                    <Hash className="mr-2 h-4 w-4" />
                    <span>Server Templates</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/store')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Store</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/quest')}>
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Quest</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/join-members')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Join Members</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/add-partnership')}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create Partnership</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/add-template')}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create Template</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/jobs')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Job Board</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="button-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="button-admin-panel">
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
            </div>
          ) : (
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
              data-testid="button-login"
            >
              <Link href="/login">
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}