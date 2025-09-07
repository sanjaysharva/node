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
    queryKey: ["/api/servers", { search: searchQuery, categories: selectedCategories, sort: sortBy }],
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
      
      <HeroSearch onSearch={handleSearch} onCategoryFilter={handleCategoryFilter} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Servers Showcase */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">🔥 Popular Servers</h2>
            <Button variant="ghost" className="text-primary hover:text-secondary">
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
                    <div className="text-6xl mb-4">🔍</div>
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
                <span className="font-bold text-xl">DiscordHub</span>
              </div>
              <p className="text-muted-foreground">
                Discover the best Discord servers and bots for your community.
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
            <p>&copy; 2024 DiscordHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
