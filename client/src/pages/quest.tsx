
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Trophy, 
  Users, 
  Video, 
  Gift, 
  ExternalLink,
  UserPlus,
  Zap,
  Copy,
  Clock,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Quest() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const inviteLink = "https://discord.gg/Ept7zwYJH5";

  // Fetch quests data from server
  const { data: questsData = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/quests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/quests");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Link Copied!",
        description: "Invite link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  // Check if user can claim daily reward (24 hours since last claim)
  const canClaimDaily = () => {
    if (!user?.lastLoginDate) return true;
    const lastLogin = new Date(user.lastLoginDate);
    const now = new Date();
    const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastLogin >= 24;
  };

  const getTimeUntilNextDaily = () => {
    if (!user?.lastLoginDate) return "Available now!";
    const lastLogin = new Date(user.lastLoginDate);
    const nextAvailable = new Date(lastLogin.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= nextAvailable) return "Available now!";
    
    const msUntil = nextAvailable.getTime() - now.getTime();
    const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursUntil}h ${minutesUntil}m`;
  };

  // Daily reward mutation
  const dailyRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quests/daily-reward/claim");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      refetch();
      toast({
        title: "Daily Reward Claimed!",
        description: `You earned ${data.reward} coins! Come back tomorrow for more.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reward Unavailable",
        description: error.message || "Please try again in 24 hours.",
        variant: "destructive",
      });
    },
  });

  // Quest claim mutation
  const claimQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const res = await apiRequest("POST", `/api/quests/${questId}/claim`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      refetch();
      toast({
        title: "Quest Completed!",
        description: `You earned ${data.reward} coins!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quest Error",
        description: error.message || "Failed to complete quest.",
        variant: "destructive",
      });
    },
  });

  // Server join mutation
  const joinServerMutation = useMutation({
    mutationFn: async () => {
      // Open Discord server in new tab
      window.open(inviteLink, '_blank', 'noopener,noreferrer');
      
      // Simulate server join verification after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await apiRequest("POST", "/api/servers/1372226433191247983/join");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      refetch();
      toast({
        title: "Server Joined!",
        description: `You earned ${data.coinsEarned} coins for joining our server!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Join Failed",
        description: error.message || "Failed to verify server join.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Authentication Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please login with Discord to access quests and start earning rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading quests...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if quest is claimable
  const isQuestClaimable = (questId: string) => {
    const quest = questsData.find((q: any) => q.id === questId);
    return quest?.claimable || false;
  };

  const isQuestCompleted = (questId: string) => {
    const quest = questsData.find((q: any) => q.id === questId);
    return quest?.completed || false;
  };

  const getQuestProgress = (questId: string) => {
    const quest = questsData.find((q: any) => q.id === questId);
    return quest ? { progress: quest.progress, target: quest.target } : { progress: 0, target: 1 };
  };

  const allQuests = [
    {
      id: "join_servers",
      title: "Join Server Communities",
      description: "Join our Discord server to get started with the community",
      reward: 10,
      icon: <Users className="w-8 h-8 text-primary" />,
      action: "Join Server",
      link: inviteLink,
      note: "Note: Leave and join again reduces reward by 1.5 coins",
      type: "server_join"
    },
    {
      id: "social-promotion",
      title: "Promote Us on Social Media",
      description: "Create an Instagram reel or YouTube video (5+ minutes) about our platform",
      reward: 1000,
      icon: <Video className="w-8 h-8 text-primary" />,
      action: "Submit Content",
      type: "social",
      cooldown: 24 * 60 * 60 * 1000 // 24 hours
    },
    {
      id: "daily_login",
      title: "Daily Check-in",
      description: "Login every day to maintain your streak and earn daily rewards",
      reward: 20,
      icon: <Gift className="w-8 h-8 text-primary" />,
      action: canClaimDaily() ? "Claim Reward" : getTimeUntilNextDaily(),
      canClaim: canClaimDaily(),
      type: "daily"
    },
    {
      id: "boost-server",
      title: "Boost Our Server",
      description: "Use Discord Nitro to boost our server and earn a big reward",
      reward: 50,
      icon: <Zap className="w-8 h-8 text-primary" />,
      action: "Boost Server",
      type: "boost"
    },
    {
      id: "invite_members",
      title: "Invite New Members",
      description: "Invite new members to our Discord server",
      reward: 15,
      icon: <UserPlus className="w-8 h-8 text-primary" />,
      action: "Start Inviting",
      note: "Earn 5 coins per member. If member leaves within 3 days: -1.75 coins",
      type: "invite"
    }
  ];

  const handleQuestAction = (quest: any) => {
    switch (quest.type) {
      case "server_join":
        joinServerMutation.mutate();
        break;
      case "daily":
        if (canClaimDaily()) {
          dailyRewardMutation.mutate();
        }
        break;
      case "social":
        // Open support ticket for manual verification
        toast({
          title: "Submit Your Content",
          description: "Please contact our support team with your content link for verification.",
        });
        break;
      case "boost":
        window.open(inviteLink, '_blank', 'noopener,noreferrer');
        break;
      case "invite":
        setInviteDialogOpen(true);
        break;
      default:
        if (isQuestClaimable(quest.id)) {
          claimQuestMutation.mutate(quest.id);
        }
    }
  };

  const getButtonText = (quest: any) => {
    const completed = isQuestCompleted(quest.id);
    const claimable = isQuestClaimable(quest.id);
    
    if (completed) return "Completed";
    if (claimable) return "Claim Reward";
    if (quest.type === "daily" && !canClaimDaily()) return getTimeUntilNextDaily();
    return quest.action;
  };

  const isButtonDisabled = (quest: any) => {
    const completed = isQuestCompleted(quest.id);
    if (completed) return true;
    
    if (quest.type === "daily" && !canClaimDaily()) return true;
    if (dailyRewardMutation.isPending || joinServerMutation.isPending || claimQuestMutation.isPending) return true;
    
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-purple-900/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-block p-3 rounded-xl bg-gradient-to-r from-orange-400 to-red-400">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                Quest Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete quests to earn coins, unlock rewards, and support our community!
              </p>
            </div>
            
            {/* Current Balance */}
            <div className="mt-6">
              <div className="inline-block bg-card border border-border rounded-xl px-6 py-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold text-foreground" data-testid="text-coin-balance">
                    {user?.coins || 0} Coins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Available Quests Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Available Quests</h2>
            <p className="text-muted-foreground">Complete these tasks to earn coins and rewards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allQuests.map((quest) => {
              const completed = isQuestCompleted(quest.id);
              const claimable = isQuestClaimable(quest.id);
              const { progress, target } = getQuestProgress(quest.id);
              
              return (
                <Card key={quest.id} className="transition-all duration-300 hover:scale-105 bg-card border-border hover:bg-card/80">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-2">
                      {quest.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                      {quest.title}
                      {completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {quest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center mb-4">
                      <Badge className={`${completed ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                        <Coins className="w-4 h-4 mr-1" />
                        {quest.reward} Coins
                      </Badge>
                    </div>

                    {/* Progress bar for quests with progress tracking */}
                    {target > 1 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}/{target}</span>
                        </div>
                        <Progress value={(progress / target) * 100} className="h-2" />
                      </div>
                    )}
                    
                    {quest.note && (
                      <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded mb-4">
                        {quest.note}
                      </div>
                    )}

                    {quest.id === "invite_members" ? (
                      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className={`w-full ${completed ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'}`}
                            disabled={isButtonDisabled(quest)}
                            data-testid="button-invite-members"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {getButtonText(quest)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border border-border">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Invite Your Friends</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Share this link with your friends to invite them to our Discord server
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text" 
                                value={inviteLink} 
                                readOnly 
                                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                                data-testid="input-invite-link"
                              />
                              <Button 
                                onClick={copyToClipboard}
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                data-testid="button-copy-invite"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground bg-primary/10 border border-primary/20 p-3 rounded">
                              <strong>Note:</strong> {quest.note}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button 
                        className={`w-full ${
                          completed 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : quest.type === "daily" && canClaimDaily()
                            ? 'bg-green-600 hover:bg-green-700'
                            : quest.type === "boost"
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : quest.type === "social"
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                        disabled={isButtonDisabled(quest)}
                        onClick={() => handleQuestAction(quest)}
                        data-testid={`button-${quest.id}`}
                      >
                        {quest.type === "server_join" && <ExternalLink className="w-4 h-4 mr-2" />}
                        {quest.type === "social" && <Video className="w-4 h-4 mr-2" />}
                        {quest.type === "daily" && <Gift className="w-4 h-4 mr-2" />}
                        {quest.type === "boost" && <Zap className="w-4 h-4 mr-2" />}
                        {completed && <CheckCircle className="w-4 h-4 mr-2" />}
                        {(dailyRewardMutation.isPending || joinServerMutation.isPending || claimQuestMutation.isPending) ? "Processing..." : getButtonText(quest)}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Information Panel */}
        <section className="mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Quest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <p>All quest completions are verified through our Discord bot system</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <p>Rewards are automatically credited to your account upon verification</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <p>Premium quests require active participation and may take time to verify</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <p>Daily rewards reset every 24 hours - don't miss your streak!</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
