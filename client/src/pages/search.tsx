
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import Navbar from "@/components/navbar";
import ServerCard from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Server } from "@shared/schema";

export default function SearchPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Get search params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [contentType, setContentType] = useState<"servers" | "bots">("servers");
  const [sortBy, setSortBy] = useState("members");

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchQuery);
      window.history.pushState({}, "", url.toString());
    }
  }, [searchQuery]);

  // Fetch search results
  const { data: searchResults, isLoading: loadingResults } = useQuery({
    queryKey: ["/api/servers/search", searchQuery, sortBy, contentType],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const params = new URLSearchParams();
      params.set("search", searchQuery);
      params.set("limit", "50");
      params.set("offset", "0");
      if (sortBy) params.set("sort", sortBy);
      
      const endpoint = contentType === "servers" ? "/api/servers" : "/api/bots";
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch ${contentType}`);
      return response.json();
    },
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleJoinServer = (serverId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to join servers.",
        variant: "destructive",
      });
      return;
    }

    const server = searchResults?.find((s: Server) => s.id === serverId);
    if (server?.inviteCode) {
      window.open(`https://discord.gg/${server.inviteCode}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Header */}
      <section className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Search Results
              {searchQuery && <span className="text-muted-foreground ml-2">for "{searchQuery}"</span>}
            </h1>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search servers, bots, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-card border-border text-foreground placeholder-muted-foreground"
                data-testid="input-search"
              />
            </div>
          </form>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Content Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="bg-muted/50 p-1 rounded-lg border border-border/50">
                <Button
                  variant={contentType === "servers" ? "default" : "ghost"}
                  onClick={() => setContentType("servers")}
                  size="sm"
                  className="rounded-md"
                  data-testid="button-filter-servers"
                >
                  <i className="fas fa-server mr-2"></i>
                  Servers
                </Button>
                <Button
                  variant={contentType === "bots" ? "default" : "ghost"}
                  onClick={() => setContentType("bots")}
                  size="sm"
                  className="rounded-md"
                  data-testid="button-filter-bots"
                >
                  <i className="fas fa-robot mr-2"></i>
                  Bots
                </Button>
              </div>
            </div>

            {/* Sort Options */}
            <Select onValueChange={setSortBy} defaultValue="members">
              <SelectTrigger className="w-48 border-border/50 bg-background/50" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="members">Sort by Members</SelectItem>
                <SelectItem value="newest">Sort by Newest</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="relevance">Sort by Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          {searchResults && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} {contentType} 
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          )}
        </section>

        {/* Search Results */}
        <section>
          {!searchQuery ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a server name, bot name, or tag to discover amazing Discord communities and tools.
              </p>
            </div>
          ) : loadingResults ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((item: any) => (
                  contentType === "servers" ? (
                    <ServerCard
                      key={item.id}
                      server={item}
                      onJoin={handleJoinServer}
                    />
                  ) : (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <i className="fas fa-robot text-2xl text-white"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>🤖 Bot</span>
                            {item.tags && (
                              <span>• {item.tags.join(", ")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => window.open(item.inviteUrl, '_blank')}>
                        Add Bot
                      </Button>
                    </div>
                  )
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-8">
                <Button variant="secondary" className="px-8 py-3" data-testid="button-load-more">
                  Load More Results
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Nothing Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any {contentType} matching "{searchQuery}". 
                Try adjusting your search terms or check out our popular communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
                <Button onClick={() => navigate("/")}>
                  Browse Popular
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <i className="fab fa-discord text-2xl text-primary"></i>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Smart Serve</span>
              </div>
              <p className="text-muted-foreground">
                Discover the best Discord servers and bots for your community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Browse</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="/explore" className="hover:text-primary transition-colors">Explore</a></li>
                <li><a href="/events" className="hover:text-primary transition-colors">Events</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Smart Serve. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
