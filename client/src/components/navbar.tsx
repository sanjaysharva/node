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
                <span className="font-bold text-xl">DiscordHub</span>
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
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`transition-colors ${
                  location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                data-testid="link-servers"
              >
                Servers
              </Link>
              <button
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-bots"
              >
                Bots
              </button>
              <button
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-categories"
              >
                Categories
              </button>
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
              Login with Discord
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
