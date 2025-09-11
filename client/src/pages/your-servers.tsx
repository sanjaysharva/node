import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Settings, ExternalLink, Crown } from "lucide-react";
import { Link } from "wouter";
import type { Server } from "@shared/schema";

export default function YourServers() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user's servers where they have admin powers
  const { data: userServers, isLoading } = useQuery({
    queryKey: ["/api/servers/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/servers/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch your servers");
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Servers
            </h1>
            <p className="text-muted-foreground mb-8">
              Please login to view your Discord servers
            </p>
            <Button onClick={() => window.location.href = '/api/auth/discord'}>
              <i className="fab fa-discord mr-2"></i>
              Login with Discord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Servers
              </h1>
              <p className="text-muted-foreground">
                Manage Discord servers where you have admin permissions
              </p>
            </div>
            <Link href="/add-server">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                data-testid="button-add-new-server"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Server
              </Button>
            </Link>
          </div>
        </div>

        {/* Server Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userServers && userServers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userServers.map((server: Server) => (
              <div className="relative">
                <Card 
                  key={server.id} 
                  className="group border border-border bg-card/50 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                  data-testid={`card-server-${server.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {server.icon ? (
                            <img 
                              src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`} 
                              alt={server.name}
                              className="w-full h-full rounded-xl object-cover"
                            />
                          ) : (
                            server.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {server.verified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-white text-xs"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-foreground mb-1 truncate">
                          {server.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {server.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{server.memberCount?.toLocaleString() || 0} members</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{server.onlineCount?.toLocaleString() || 0} online</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {server.tags && server.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {server.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {server.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{server.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Admin Badge */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Crown className="w-4 h-4" />
                        <span className="text-sm font-medium">Admin</span>
                      </div>
                      {server.featured && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                        onClick={() => window.open(`https://discord.gg/${server.inviteCode}`, '_blank')}
                        data-testid={`button-visit-${server.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                        data-testid={`button-manage-${server.id}`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Advertise Shadow */}
                <div className="relative">
                  <div className="absolute inset-x-0 top-2 h-8 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-lg blur-sm"></div>
                  <Link href="/add-server">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 h-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20 hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-400/40 transition-all duration-300 text-purple-300 hover:text-purple-200"
                      data-testid={`button-advertise-${server.id}`}
                    >
                      <i className="fas fa-megaphone mr-2 text-xs"></i>
                      Advertise
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Crown className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">No servers found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You don't have any servers listed on Smart Serve yet. Add your first server to get started!
            </p>
            <Link href="/add-server">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                data-testid="button-add-first-server"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Server
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}