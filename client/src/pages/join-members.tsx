
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import ServerCard from "@/components/server-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server, User } from "@shared/schema";
import { Coins, Users, TrendingUp, AlertCircle, CheckCircle, Wallet, Plus, Star, Bot, ExternalLink } from "lucide-react";

export default function JoinMembers() {
  const [membersToGet, setMembersToGet] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [botCheckDialogOpen, setBotCheckDialogOpen] = useState(false);
  const [botCheckData, setBotCheckData] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch advertising servers (servers that give coins when joined)
  const { data: advertisingServers, isLoading: loadingServers } = useQuery<Server[]>({
    queryKey: ["/api/servers/advertising"],
    enabled: isAuthenticated,
  });

  // Fetch user's admin servers for advertising
  const { data: userServers, isLoading: loadingUserServers } = useQuery<Server[]>({
    queryKey: ["/api/servers/user", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Join server mutation
  const joinServerMutation = useMutation({
    mutationFn: async (serverId: string) => {
      const res = await apiRequest("POST", `/api/servers/${serverId}/join`);
      return res.json();
    },
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/servers/advertising"] });
      toast({
        title: "Success!",
        description: `You earned ${data.coinsEarned || 1} coins for joining the server!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join server",
        variant: "destructive",
      });
    },
  });

  // Purchase members mutation
  const purchaseMembersMutation = useMutation({
    mutationFn: async ({ serverId, members }: { serverId: string; members: number }) => {
      const res = await apiRequest("POST", `/api/servers/${serverId}/advertise`, { members });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/servers/user", user?.id] });
      setDialogOpen(false);
      setMembersToGet("");
      setSelectedServer("");
      toast({
        title: "Success!",
        description: "Your server is now being advertised to gain members!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase advertising",
        variant: "destructive",
      });
    },
  });

  const handleJoinServer = async (serverId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to join servers and earn coins.",
        variant: "destructive",
      });
      return;
    }

    const server = advertisingServers?.find(s => s.id === serverId);
    if (server?.inviteCode) {
      // Open Discord invite
      window.open(`https://discord.gg/${server.inviteCode}`, '_blank', 'noopener,noreferrer');

      // Award coins for joining
      joinServerMutation.mutate(serverId);
    }
  };

  // Bot check mutation
  const botCheckMutation = useMutation({
    mutationFn: async (serverId: string) => {
      const server = userServers?.find(s => s.id === serverId);
      const guildId = server?.discordId ?? server?.id;
      if (!guildId) {
        throw new Error("Server ID not found");
      }
      const res = await apiRequest("GET", `/api/discord/bot-check/${guildId}`);
      return res.json();
    },
    onSuccess: (data) => {
      setBotCheckData(data);
      if (!data.botPresent) {
        setBotCheckDialogOpen(true);
      } else {
        // Bot is present, proceed with purchase
        proceedWithPurchase();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Bot Check Failed",
        description: error.message || "Failed to check bot presence",
        variant: "destructive",
      });
    },
  });

  const proceedWithPurchase = () => {
    const members = parseInt(membersToGet);
    purchaseMembersMutation.mutate({
      serverId: selectedServer,
      members,
    });
  };

  const handlePurchaseMembers = async () => {
    const members = parseInt(membersToGet);
    if (!members || members < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of members.",
        variant: "destructive",
      });
      return;
    }

    const coinsNeeded = members * 2;
    const userCoins = user?.coins || 0;
    if (userCoins < coinsNeeded) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${coinsNeeded} coins but only have ${userCoins}.`,
        variant: "destructive",
      });
      return;
    }

    if (!selectedServer) {
      toast({
        title: "Server Required",
        description: "Please select a server to advertise.",
        variant: "destructive",
      });
      return;
    }

    // Check if bot is present in the selected server
    botCheckMutation.mutate(selectedServer);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please login with Discord to access the Join Members feature and start earning coins.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header with Wallet in Corner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Join Members Exchange
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Join amazing Discord servers to earn coins, then use those coins to get members for your own server!
            </p>
            <div className="mt-6 flex items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Earn 1 coin per join</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                <span>2 coins per member</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
                <span>Fair & Fast</span>
              </div>
            </div>
          </div>
          
          {/* Wallet Card in Top Right */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 w-80">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">
                  <Coins className="inline w-6 h-6 mr-1" />
                  {user?.coins || 0}
                </div>
                <p className="text-sm text-muted-foreground">Available Coins</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Join Reward:</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">+1 coin</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member Cost:</span>
                  <Badge variant="outline" className="border-primary text-primary">2 coins</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Servers to Join - Top Priority */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                🚀 Join Servers & Earn Coins
              </h2>
              <p className="text-muted-foreground text-lg">
                Join these servers and earn 1 coin for each one. Click to join and automatically earn your reward!
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Available Servers:</div>
              <div className="text-2xl font-bold text-primary">{advertisingServers?.length || 0}</div>
            </div>
          </div>

          {loadingServers ? (
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
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : advertisingServers && advertisingServers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advertisingServers.map((server: Server) => (
                <Card key={server.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-green-500/90 text-white">
                      <Coins className="w-3 h-3 mr-1" />
                      +1 coin
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        {server.icon ? (
                          <img src={server.icon} alt={server.name} className="w-full h-full rounded-xl" />
                        ) : (
                          <i className="fas fa-server text-white text-2xl"></i>
                        )}
                      </div>
                      <div className="flex-1 pr-8">
                        <CardTitle className="text-xl line-clamp-1">{server.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{server.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          <i className="fas fa-users mr-1"></i>
                          {server.memberCount?.toLocaleString()} members
                        </span>
                        <span>
                          <i className="fas fa-circle text-green-500 mr-1"></i>
                          {server.onlineCount?.toLocaleString()} online
                        </span>
                      </div>
                      {server.verified && (
                        <div className="flex items-center text-blue-500">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mb-4">
                      <span>Members needed: {server.advertisingMembersNeeded}</span>
                    </div>

                    <Button
                      onClick={() => handleJoinServer(server.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      disabled={joinServerMutation.isPending}
                      data-testid={`button-join-server-${server.id}`}
                    >
                      {joinServerMutation.isPending ? (
                        "Processing..."
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Join & Earn 1 Coin
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No servers available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Check back later for new servers where you can join and earn coins!
              </p>
            </div>
          )}
        </div>

        {/* Member Purchase Section - Below */}
        <section className="mb-8">
        <Card className="bg-card border border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Get Members for Your Server
                </CardTitle>
                <CardDescription className="text-lg">
                  Purchase advertising to grow your server community. Exchange your earned coins for real members!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="members-input" className="text-base font-medium">Members to Get</Label>
                    <Input
                      id="members-input"
                      type="number"
                      min="1"
                      placeholder="Enter number of members"
                      value={membersToGet}
                      onChange={(e) => setMembersToGet(e.target.value)}
                      className="mt-2 text-lg"
                      data-testid="input-members"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Cost Calculator</Label>
                    <div className="mt-2 p-3 bg-primary/10 border border-primary/30 rounded-md">
                      <div className="text-2xl font-bold text-primary">
                        {membersToGet ? parseInt(membersToGet) * 2 : 0} coins
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rate: 2 coins per member
                      </div>
                    </div>
                  </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      disabled={!membersToGet || parseInt(membersToGet) < 1}
                      data-testid="button-get-members"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Get {membersToGet || 0} Members
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Server to Advertise</DialogTitle>
                      <DialogDescription>
                        Choose which of your admin servers you want to advertise for {membersToGet} members.
                        Cost: {membersToGet ? parseInt(membersToGet) * 2 : 0} coins
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {loadingUserServers ? (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : userServers && userServers.length > 0 ? (
                        <div className="space-y-2">
                          <Label>Your Servers</Label>
                          <Select onValueChange={setSelectedServer} data-testid="select-server">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a server" />
                            </SelectTrigger>
                            <SelectContent>
                              {userServers
                                .filter(server => !server.isAdvertising)
                                .map((server) => (
                                  <SelectItem key={server.id} value={server.id}>
                                    <div className="flex items-center space-x-2">
                                      <span>{server.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {server.memberCount} members
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {userServers.every(server => server.isAdvertising) && (
                            <div className="flex items-center space-x-2 text-primary">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">All your servers are currently being advertised</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                          <p>You don't have any servers where you're an admin.</p>
                          <p className="text-xs mt-1">Only servers with our bot can be advertised.</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePurchaseMembers}
                          disabled={!selectedServer || purchaseMembersMutation.isPending || botCheckMutation.isPending || !userServers}
                          data-testid="button-confirm-purchase"
                        >
                          {botCheckMutation.isPending ? "Checking Bot..." : purchaseMembersMutation.isPending ? "Processing..." : "Confirm Purchase"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Bot Invitation Dialog */}
                <Dialog open={botCheckDialogOpen} onOpenChange={setBotCheckDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-blue-500" />
                        <span>Bot Required</span>
                      </DialogTitle>
                      <DialogDescription>
                        Smart Serve bot needs to be added to your server to enable member advertising.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Why is the bot needed?</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              The Smart Serve bot tracks member joins, awards coins automatically, and manages the advertising system.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={() => {
                            if (botCheckData?.inviteUrl) {
                              window.open(botCheckData.inviteUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          data-testid="button-invite-bot"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Invite Smart Serve Bot
                        </Button>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          After inviting the bot, you can come back and advertise your server.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setBotCheckDialogOpen(false);
                            setSelectedServer("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            setBotCheckDialogOpen(false);
                            // Re-check bot presence and proceed if present
                            botCheckMutation.mutate(selectedServer);
                          }}
                          variant="default"
                        >
                          Check Again
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">How it works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Join servers to earn coins</li>
                    <li>• Use coins to advertise your server</li>
                    <li>• Real members join your server</li>
                    <li>• Fair exchange system</li>
                  </ul>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2">Important</h4>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Leave Penalty: If you leave a server within 3 days of joining, you'll lose 0.75 coins
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                Smart communities, smarter connections. Join servers, earn coins, grow your community.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Join Members</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Server Discovery</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Coin System</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/help-center" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="/help-center" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="https://discord.gg/smartserve" className="hover:text-primary transition-colors">Discord Server</a></li>
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
