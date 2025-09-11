import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import HeroSearch from "@/components/hero-search";
import ServerCard from "@/components/server-card";
import CategoryFilters from "@/components/category-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Server, Category } from "@shared/schema";
import { AdBanner } from "@/components/ad-banner";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [contentType, setContentType] = useState<"servers" | "bots">("servers");
  const [sortBy, setSortBy] = useState("members");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch popular servers
  const { data: popularServers, isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/servers/popular"],
  });

  // Fetch all servers with filters
  const { data: allServers, isLoading: loadingServers } = useQuery({
    queryKey: ["/api/servers", searchQuery, selectedCategories.join(","), sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategories.length > 0) params.set("categoryId", selectedCategories[0]);
      params.set("limit", "20");
      params.set("offset", "0");
      
      const response = await fetch(`/api/servers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch servers");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    const categoryObj = categories.find((c: Category) => c.slug === category);
    if (categoryObj) {
      setSelectedCategories([categoryObj.id]);
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
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

    // Find the server and redirect to Discord invite
    const server = allServers?.find((s: Server) => s.id === serverId) ||
                  popularServers?.find((s: Server) => s.id === serverId);

    if (server?.inviteCode) {
      window.open(`https://discord.gg/${server.inviteCode}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Bot Invite Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-purple-900/50 rounded-2xl border border-purple-400/30 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Invite Smart Serve Bot for Your Server
                </h3>
                <p className="text-purple-200 text-sm">
                  Get moderation, analytics, and community tools all in one powerful bot
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=1372226433191247983&permissions=8&scope=bot%20applications.commands', '_blank')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
              data-testid="button-invite-bot"
            >
              <i className="fas fa-plus mr-2"></i>
              Invite Bot
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSearch onSearch={handleSearch} onCategoryFilter={handleCategoryFilter} />
        
        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>10K+ Active Servers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            <span>5K+ Trusted Bots</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
            <span>1M+ Members</span>
          </div>
        </div>

        {/* Header Ad */}
        <AdBanner position="header" className="mt-8" />
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Servers Showcase */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Popular Servers
              </h2>
            </div>
            <Button variant="ghost" className="text-primary hover:text-secondary transition-all duration-300 hover:scale-105">
              View All
            </Button>
          </div>

          {loadingPopular ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularServers?.map((server: Server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onJoin={handleJoinServer}
                />
              ))}
            </div>
          )}
        </section>

        {/* Categories and Filters */}
        <section>
          <CategoryFilters
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            onContentTypeChange={setContentType}
            onSortChange={setSortBy}
            contentType={contentType}
          />

          <div className="lg:w-3/4 lg:ml-auto lg:-mt-16">
            {loadingServers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[...Array(8)].map((_, i) => (
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
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {allServers?.map((server: Server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      onJoin={handleJoinServer}
                    />
                  ))}
                </div>

                {allServers && allServers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-400 border-dashed rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No servers found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or category filters
                    </p>
                  </div>
                )}

                {allServers && allServers.length > 0 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="secondary"
                      className="px-6 py-3"
                      data-testid="button-load-more"
                    >
                      Load More Servers
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
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
                Smart communities, smarter connections. Discover the best Discord servers and bots for your community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Browse</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Discord Servers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord Bots</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Popular</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
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