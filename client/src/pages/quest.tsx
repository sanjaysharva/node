import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Gift, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Quest() {
  const { isAuthenticated } = useAuth();
  const [completedQuests, setCompletedQuests] = useState([1, 3]);

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

  const quests = [
    {
      id: 1,
      title: "First Server Join",
      description: "Join your first Discord server through Smart Serve",
      reward: "10 Coins + Welcome Badge",
      progress: 100,
      maxProgress: 100,
      difficulty: "Easy",
      type: "daily",
      icon: Target,
      completed: true
    },
    {
      id: 2,
      title: "Review Master",
      description: "Write 5 helpful server reviews",
      reward: "25 Coins + Critic Badge",
      progress: 60,
      maxProgress: 100,
      difficulty: "Medium",
      type: "weekly",
      icon: Star,
      completed: false
    },
    {
      id: 3,
      title: "Community Explorer",
      description: "Join 10 different servers",
      reward: "50 Coins + Explorer Badge",
      progress: 100,
      maxProgress: 100,
      difficulty: "Medium",
      type: "achievement",
      icon: Trophy,
      completed: true
    },
    {
      id: 4,
      title: "Daily Active",
      description: "Log in for 7 consecutive days",
      reward: "15 Coins + Loyal Badge",
      progress: 40,
      maxProgress: 100,
      difficulty: "Easy",
      type: "daily",
      icon: Clock,
      completed: false
    },
    {
      id: 5,
      title: "Premium Supporter",
      description: "Join 3 premium servers",
      reward: "100 Coins + VIP Badge",
      progress: 0,
      maxProgress: 100,
      difficulty: "Hard",
      type: "premium",
      icon: Gift,
      completed: false
    }
  ];

  const categories = [
    { name: "All", count: 5, active: true },
    { name: "Daily", count: 2, active: false },
    { name: "Weekly", count: 1, active: false },
    { name: "Achievement", count: 1, active: false },
    { name: "Premium", count: 1, active: false }
  ];

  const stats = {
    totalCoins: 247,
    completedQuests: 2,
    totalQuests: 5,
    level: 3,
    xp: 750,
    nextLevelXp: 1000
  };

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
                <div className="text-2xl font-bold text-primary mb-1">{stats.totalCoins}</div>
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
            const IconComponent = quest.icon;
            const isCompleted = completedQuests.includes(quest.id);
            
            return (
              <Card key={quest.id} className={`relative overflow-hidden ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-500' : 
                        quest.type === 'daily' ? 'bg-blue-500' :
                        quest.type === 'weekly' ? 'bg-purple-500' :
                        quest.type === 'achievement' ? 'bg-orange-500' :
                        'bg-pink-500'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {quest.title}
                          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            quest.difficulty === 'Easy' ? 'default' :
                            quest.difficulty === 'Medium' ? 'secondary' :
                            'destructive'
                          } size="sm">
                            {quest.difficulty}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {quest.type}
                          </Badge>
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
                          {quest.progress}%
                        </span>
                      </div>
                      <Progress value={quest.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {quest.reward}
                      </div>
                      <Button 
                        size="sm" 
                        disabled={isCompleted}
                        data-testid={`quest-action-${quest.id}`}
                      >
                        {isCompleted ? 'Completed' : 'Start Quest'}
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