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
import { Coins, Users, TrendingUp, AlertCircle, CheckCircle, Wallet } from "lucide-react";

export default function JoinMembers() {
  const [membersToGet, setMembersToGet] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
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
    onSuccess: (data: any) => {
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
    const userCoins = (user as any)?.coins || 0;
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

    purchaseMembersMutation.mutate({
      serverId: selectedServer,
      members,
    });
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

      {/* Wallet Section - Top Middle */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-2 border-primary/30 bg-gradient-to-br from-purple-50/50 to-primary/10 dark:from-primary/5 dark:to-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                    <Coins className="inline w-8 h-8 mr-2 text-primary" />
                    {(user as any)?.coins || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Available Coins</p>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center justify-between">
                    <span>Join Server Reward:</span>
                    <Badge variant="secondary">+1 coin</Badge>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Member Price:</span>
                    <Badge variant="outline">2 coins each</Badge>
                  </p>
                  <div className="mt-3 p-2 bg-primary/10 border border-primary/30 rounded-md">
                    <p className="text-xs text-primary font-medium">
                      ⚠️ Leave Penalty: If you leave a server within 3 days of joining, you'll lose 0.75 coins
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Member Purchase Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Get Members for Your Server
            </CardTitle>
            <CardDescription>
              Purchase advertising to grow your server. 1 member = 2 coins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="members-input">Members to Get</Label>
                <Input
                  id="members-input"
                  type="number"
                  min="1"
                  placeholder="Enter number of members"
                  value={membersToGet}
                  onChange={(e) => setMembersToGet(e.target.value)}
                  data-testid="input-members"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cost: {membersToGet ? parseInt(membersToGet) * 2 : 0} coins
                </p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={!membersToGet || parseInt(membersToGet) < 1}
                    data-testid="button-get-members"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Get Members
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
                              .filter(server => !server.isAdvertising) // Only show servers not currently advertising
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
                        disabled={!selectedServer || purchaseMembersMutation.isPending}
                        data-testid="button-confirm-purchase"
                      >
                        {purchaseMembersMutation.isPending ? "Processing..." : "Confirm Purchase"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Advertising Servers Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Join Servers & Earn Coins
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Join these amazing Discord servers and earn 1 coin for each server you join!
          </p>
        </div>

        {loadingServers ? (
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
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span>Members needed: {server.advertisingMembersNeeded}</span>
                    </div>
                    {server.verified && (
                      <div className="flex items-center text-blue-500">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
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
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Smart Serve. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}