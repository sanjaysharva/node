import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Coins, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Crown,
  Shield,
  Zap
} from "lucide-react";
import Navbar from "@/components/navbar";
import { Link } from "wouter";

interface Server {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  inviteUrl: string;
  memberCount: number;
  category: string;
  tags: string[];
  discordId: string;
  isAdvertising: boolean;
  advertisingType?: string;
  coinsPerMember?: number;
}

export default function JoinMembers() {
  const [membersToGet, setMembersToGet] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [botCheckDialogOpen, setBotCheckDialogOpen] = useState(false);
  const [botCheckData, setBotCheckData] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch member-exchange advertising servers (servers that give coins when joined)
  const { data: advertisingServers, isLoading: loadingServers } = useQuery<Server[]>({
    queryKey: ["/api/servers/advertising", "member_exchange"],
    queryFn: async () => {
      const response = await fetch("/api/servers/advertising?type=member_exchange");
      if (!response.ok) throw new Error("Failed to fetch advertising servers");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch user's admin servers for advertising
  const { data: userServers, isLoading: loadingUserServers } = useQuery<Server[]>({
    queryKey: ["/api/servers/user", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Purchase members mutation
  const purchaseMembersMutation = useMutation({
    mutationFn: async ({ serverId, members }: { serverId: string; members: number }) => {
      const response = await fetch("/api/servers/purchase-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId, members }),
      });
      if (!response.ok) throw new Error("Failed to purchase members");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setDialogOpen(false);
      setMembersToGet("");
      setSelectedServer("");
      toast({
        title: "Purchase Successful!",
        description: `Successfully purchased ${data.members} members for your server!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase members",
        variant: "destructive",
      });
    },
  });

  // Bot check mutation
  const botCheckMutation = useMutation({
    mutationFn: async (serverId: string) => {
      const server = userServers?.find(s => s.id === serverId);
      const guildId = server?.discordId ?? server?.id;
      if (!guildId) {
        throw new Error("Server ID not found");
      }
      const res = await fetch(`/api/discord/bot-check/${guildId}`);
      if (!res.ok) throw new Error("Bot check failed");
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

    if (!selectedServer) {
      toast({
        title: "Server Required",
        description: "Please select a server to advertise.",
        variant: "destructive",
      });
      return;
    }

    const totalCost = members * 2;
    const userCoins = user?.coins || 0;

    if (userCoins < totalCost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${totalCost} coins but only have ${userCoins}. Join more servers to earn coins!`,
        variant: "destructive",
      });
      return;
    }

    // First check if bot is present in the server
    botCheckMutation.mutate(selectedServer);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to access the member exchange.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header with Title and Wallet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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

          {/* Wallet Display */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-300 dark:border-yellow-800 shadow-lg">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">Your Wallet</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {user?.coins || 0}
                </div>
                <div className="text-sm text-muted-foreground">coins</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-4">
            <Card className="bg-card border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/trade">
                  <Button variant="outline" className="w-full justify-start border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20">
                    <Coins className="w-4 h-4 mr-2 text-green-600" />
                    Trade Coins
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                  Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20">
                  <Crown className="w-4 h-4 mr-2 text-purple-600" />
                  Premium
                </Button>
              </CardContent>
            </Card>

            {/* Fair Play Rules */}
            <Card className="bg-card border border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-sm font-semibold text-green-600">Fair Play Rules</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Stay in servers for 24h minimum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>No fake or bot accounts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Respect server rules</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Member Purchase Section */}
            <Card className="bg-card border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-950/20 to-blue-950/20 dark:from-purple-950/30 dark:to-blue-950/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      🚀 Grow Your Server Community
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Transform your earned coins into real members for your Discord server!
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
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-md">
                          <div className="text-2xl font-bold text-blue-600">
                            {membersToGet ? parseInt(membersToGet) * 2 : 0} coins
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rate: 2 coins per member
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Select Your Server</Label>
                      <Select value={selectedServer} onValueChange={setSelectedServer}>
                        <SelectTrigger className="mt-2 text-lg">
                          <SelectValue placeholder="Choose server to advertise" />
                        </SelectTrigger>
                        <SelectContent>
                          {userServers?.map((server) => (
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
                    </div>

                    <Button
                      onClick={() => setDialogOpen(true)}
                      disabled={!membersToGet || !selectedServer || loadingUserServers}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6"
                      data-testid="button-purchase"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Purchase {membersToGet || 0} Members for {membersToGet ? parseInt(membersToGet) * 2 : 0} Coins
                    </Button>
                  </div>

                  {/* Stats Section */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Join Reward:</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-600">+1 coin</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Member Cost:</span>
                        <Badge variant="outline" className="border-blue-600 text-blue-600">2 coins</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Servers to Join Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  🎯 Servers to Join (Earn Coins)
                </h2>
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  +1 coin per join
                </Badge>
              </div>

              {loadingServers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="w-full h-32 bg-muted rounded-md"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : advertisingServers && advertisingServers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {advertisingServers.map((server) => (
                    <Card key={server.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-green-300">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {server.imageUrl && (
                            <div className="relative overflow-hidden rounded-lg">
                              <img
                                src={server.imageUrl}
                                alt={server.name}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {server.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {server.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {server.memberCount.toLocaleString()} members
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                              +1 coin
                            </Badge>
                          </div>
                          <Button
                            asChild
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                            data-testid={`button-join-${server.id}`}
                          >
                            <a href={server.inviteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Join & Earn
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No servers available to join at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Member Purchase</DialogTitle>
            <DialogDescription>
              You're about to purchase {membersToGet} members for {membersToGet ? parseInt(membersToGet) * 2 : 0} coins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Members:</span>
                <span className="font-semibold">{membersToGet}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per member:</span>
                <span>2 coins</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total cost:</span>
                <span className="font-semibold">{membersToGet ? parseInt(membersToGet) * 2 : 0} coins</span>
              </div>
              <div className="flex justify-between">
                <span>Your balance:</span>
                <span>{user?.coins || 0} coins</span>
              </div>
              <div className="flex justify-between">
                <span>After purchase:</span>
                <span>{(user?.coins || 0) - (membersToGet ? parseInt(membersToGet) * 2 : 0)} coins</span>
              </div>
            </div>
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

      {/* Bot Check Dialog */}
      <Dialog open={botCheckDialogOpen} onOpenChange={setBotCheckDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bot Required</DialogTitle>
            <DialogDescription>
              Our bot needs to be in your server to deliver members. Please add our bot first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                The bot is required to:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                <li>Send invites to members</li>
                <li>Track successful joins</li>
                <li>Manage member delivery</li>
              </ul>
            </div>
            <div className="flex justify-between space-x-2">
              <Button variant="outline" onClick={() => setBotCheckDialogOpen(false)}>
                Cancel
              </Button>
              <Button asChild>
                <a 
                  href={botCheckData?.inviteUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Add Bot
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}