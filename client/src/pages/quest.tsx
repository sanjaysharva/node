import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Gift, Clock, CheckCircle, Users, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  reward: number;
  target: number;
  progress: number;
  completed: boolean;
  claimable: boolean;
}

export default function Quest() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch real quest data from API
  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ['/api/quests'],
    enabled: isAuthenticated,
  });

  // Quest claiming mutation
  const claimQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await apiRequest(`/api/quests/${questId}/claim`, 'POST');
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Quest Completed! 🎉",
        description: `You earned ${data.reward} coins! New balance: ${data.newBalance}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim quest reward",
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
              Please login with Discord to access Quests and earn rewards.
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
            <h1 className="text-3xl font-bold mb-4 text-foreground">Loading Quests...</h1>
          </div>
        </div>
      </div>
    );
  }

  // Map quest types to icons
  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'invite': return Users;
      case 'join_servers': return Target;
      case 'daily_login': return Calendar;
      case 'referral': return Trophy;
      default: return Star;
    }
  };

  // Calculate stats from real quest data
  const stats = {
    totalCoins: 0, // This will be fetched from user data
    completedQuests: quests.filter((q: Quest) => q.completed).length,
    totalQuests: quests.length,
    level: Math.floor(quests.filter((q: Quest) => q.completed).length / 2) + 1,
    xp: quests.filter((q: Quest) => q.completed).length * 100,
    nextLevelXp: 1000
  };

  // Calculate quest categories from real data
  const categories = [
    { name: "All", count: quests.length, active: true },
    { name: "Invite", count: quests.filter((q: Quest) => q.type === 'invite').length, active: false },
    { name: "Join Servers", count: quests.filter((q: Quest) => q.type === 'join_servers').length, active: false },
    { name: "Daily Login", count: quests.filter((q: Quest) => q.type === 'daily_login').length, active: false },
    { name: "Referral", count: quests.filter((q: Quest) => q.type === 'referral').length, active: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Quest Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete quests, earn rewards, and level up your Discord journey
            </p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary mb-1">—</div>
                <div className="text-sm text-muted-foreground">Total Coins</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-secondary mb-1">{stats.completedQuests}/{stats.totalQuests}</div>
                <div className="text-sm text-muted-foreground">Quests Completed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500 mb-1">Level {stats.level}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-500 mb-1">{stats.xp}</div>
                <div className="text-sm text-muted-foreground">Experience Points</div>
                <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quest Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className="relative"
              data-testid={`filter-${category.name.toLowerCase()}`}
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Quest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => {
            const IconComponent = getQuestIcon(quest.type);
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
            
            return (
              <Card key={quest.id} className={`relative overflow-hidden ${quest.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        quest.completed ? 'bg-green-500' : 
                        quest.type === 'invite' ? 'bg-blue-500' :
                        quest.type === 'join_servers' ? 'bg-purple-500' :
                        quest.type === 'daily_login' ? 'bg-orange-500' :
                        'bg-pink-500'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {quest.title}
                          {quest.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {quest.type.replace('_', ' ')}
                          </Badge>
                          {quest.claimable && !quest.completed && (
                            <Badge variant="default" className="bg-yellow-500">
                              Ready to Claim!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">
                    {quest.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {quest.progress}/{quest.target} ({progressPercent.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {quest.reward} Coins
                      </div>
                      <Button 
                        size="sm" 
                        disabled={!quest.claimable || claimQuestMutation.isPending}
                        onClick={() => claimQuestMutation.mutate(quest.id)}
                        data-testid={`quest-action-${quest.id}`}
                      >
                        {quest.completed ? 'Completed' : 
                         quest.claimable ? (claimQuestMutation.isPending ? 'Claiming...' : 'Claim Reward') :
                         'In Progress'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}