import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Trophy, 
  Users, 
  Video, 
  Gift, 
  Crown,
  ExternalLink,
  Calendar,
  UserPlus,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function Quest() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [lastDailyReward, setLastDailyReward] = useState<string | null>(null);
  
  // Check if user can claim daily reward (24 hours since last claim)
  const canClaimDaily = () => {
    if (!lastDailyReward) return true;
    const lastClaim = new Date(lastDailyReward);
    const now = new Date();
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastClaim >= 24;
  };

  const getTimeUntilNextDaily = () => {
    if (!lastDailyReward) return "Available now!";
    const lastClaim = new Date(lastDailyReward);
    const nextAvailable = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
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
      const res = await apiRequest("POST", "/api/quests/daily-reward");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLastDailyReward(new Date().toISOString());
      toast({
        title: "Daily Reward Claimed!",
        description: `You earned ${data.coinsEarned} coins! Come back tomorrow for more.`,
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please login with Discord to access quests and start earning rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const quests = [
    {
      id: "join-server",
      title: "Join Our Server",
      description: "Join our Discord server to get started with the community",
      reward: 2,
      icon: <Users className="w-8 h-8 text-blue-400" />,
      action: "Join Server",
      link: "https://discord.gg/Ept7zwYJH5",
      note: "Note: Leave and join again reduces reward by 1.5 coins",
      type: "basic"
    },
    {
      id: "social-promotion",
      title: "Promote Us on Social Media",
      description: "Create an Instagram reel or YouTube video (5+ minutes) about our platform",
      reward: 1000,
      icon: <Video className="w-8 h-8 text-pink-400" />,
      action: "Submit Content",
      type: "high-reward"
    },
    {
      id: "daily-reward",
      title: "Daily Check-in",
      description: "Click the reward button below every 24 hours to earn coins",
      reward: 2,
      icon: <Gift className="w-8 h-8 text-green-400" />,
      action: canClaimDaily() ? "Claim Reward" : getTimeUntilNextDaily(),
      canClaim: canClaimDaily(),
      type: "daily"
    },
    {
      id: "boost-server",
      title: "Boost Our Server",
      description: "Use Discord Nitro to boost our server and earn a big reward",
      reward: 50,
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      action: "Boost Server",
      type: "premium"
    }
  ];

  const premiumQuests = [
    {
      id: "invite-members",
      title: "Invite Members",
      description: "Invite new members to our Discord server",
      reward: 3,
      icon: <UserPlus className="w-8 h-8 text-orange-400" />,
      action: "Start Inviting",
      note: "Earn 3 coins per member. If member leaves: -1.75 coins",
      type: "premium"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            <Trophy className="inline w-10 h-10 mr-4 text-yellow-400" />
            Quest Hub
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Complete quests to earn coins, unlock rewards, and support our community!
          </p>
          
          {/* Current Balance */}
          <div className="mt-6">
            <Card className="inline-block bg-white/10 border-white/20">
              <CardContent className="py-3 px-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                  <span className="text-xl font-bold text-white">
                    {(user as any)?.coins || 0} Coins
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Regular Quests Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Available Quests</h2>
            <p className="text-gray-300">Complete these tasks to earn coins and rewards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quests.map((quest) => (
              <Card key={quest.id} className="transition-all duration-300 hover:scale-105 bg-white/5 border-white/20 hover:bg-white/10">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    {quest.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {quest.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {quest.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center mb-4">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      <Coins className="w-4 h-4 mr-1" />
                      {quest.reward} Coins
                    </Badge>
                  </div>
                  
                  {quest.note && (
                    <div className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded mb-4">
                      {quest.note}
                    </div>
                  )}

                  {quest.id === "join-server" && (
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(quest.link, '_blank', 'noopener,noreferrer')}
                      data-testid="button-join-server"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {quest.action}
                    </Button>
                  )}

                  {quest.id === "social-promotion" && (
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" 
                      data-testid="button-submit-content"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {quest.action}
                    </Button>
                  )}

                  {quest.id === "daily-reward" && (
                    <Button 
                      className={`w-full ${canClaimDaily() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                      disabled={!canClaimDaily() || dailyRewardMutation.isPending}
                      onClick={() => canClaimDaily() && dailyRewardMutation.mutate()}
                      data-testid="button-daily-reward"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {dailyRewardMutation.isPending ? "Claiming..." : quest.action}
                    </Button>
                  )}

                  {quest.id === "boost-server" && (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700" 
                      onClick={() => window.open("https://discord.gg/Ept7zwYJH5", '_blank', 'noopener,noreferrer')}
                      data-testid="button-boost-server"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {quest.action}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-16 bg-white/20" />

        {/* Premium Quests Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-purple-400" />
              Premium Quests
            </h2>
            <p className="text-gray-300">Exclusive high-reward quests for dedicated members</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumQuests.map((quest) => (
              <Card key={quest.id} className="transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-400/30 hover:border-purple-400/50">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Crown className="w-6 h-6 text-purple-400 mr-2" />
                    {quest.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {quest.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {quest.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center mb-4">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <Coins className="w-4 h-4 mr-1" />
                      {quest.reward} Coins Each
                    </Badge>
                  </div>
                  
                  {quest.note && (
                    <div className="text-xs text-purple-300 bg-purple-500/10 p-2 rounded mb-4">
                      {quest.note}
                    </div>
                  )}

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    onClick={() => window.open("https://discord.gg/Ept7zwYJH5", '_blank', 'noopener,noreferrer')}
                    data-testid="button-invite-members"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {quest.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Information Panel */}
        <section className="mb-8">
          <Card className="bg-white/5 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Quest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
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
      </div>
    </div>
  );
}