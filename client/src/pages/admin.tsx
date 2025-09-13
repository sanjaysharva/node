import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit, Timer, Upload, Image, Play, Pause, Eye, EyeOff, Zap, TrendingUp, Star, Users, Server, Bot, Calendar, MessageCircle, BarChart3, Search, Filter, Settings, Activity, Download, FileText, Globe, Shield, HeartHandshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/navbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Interface definitions
interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  budget: number;
  spent: number;
  createdAt: string;
}

interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  status: 'read' | 'unread';
}

interface ServerAnalytics {
  serverId: string;
  serverName: string;
  memberCount: number;
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  activeMembers: number;
  messagesSent: number;
  joinRate: number;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for live chat
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  // State for server management
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  // Fetch data with new endpoints
  const { data: adsData, isLoading: adsLoading, refetch: refetchAds } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
    queryFn: async () => {
      const response = await fetch("/api/ads");
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: liveStats } = useQuery({
    queryKey: ["/api/admin/live-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/live-stats");
      if (!response.ok) throw new Error("Failed to fetch live stats");
      return response.json();
    },
    enabled: !!user?.isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: serverAnalytics } = useQuery<ServerAnalytics[]>({
    queryKey: ["/api/admin/server-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/server-analytics");
      if (!response.ok) throw new Error("Failed to fetch server analytics");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: allServers } = useQuery<any[]>({
    queryKey: ["/api/servers"],
    queryFn: async () => {
      const response = await fetch("/api/servers");
      if (!response.ok) throw new Error("Failed to fetch servers");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // State for forms
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [formData, setFormData] = useState<Omit<Ad, 'id' | 'createdAt' | 'impressions' | 'clicks' | 'isActive' | 'budget' | 'spent'>>({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    position: "header", // This field seems to be from the original code's form but not in the new Ad interface. It might need to be removed or mapped.
  });

  // Google Ad Preview Component
  const GoogleAdPreview = ({ ad }: { ad: any }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
      <div className="flex items-start space-x-3">
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt="Ad" className="w-16 h-16 object-cover rounded" />
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs text-gray-500">Ad</span>
            <Globe className="w-3 h-3 text-gray-500" />
          </div>
          <h3 className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
            {ad.title || "Advertisement Title"}
          </h3>
          <p className="text-gray-800 text-sm mt-1">
            {ad.description || "Advertisement description goes here..."}
          </p>
          <div className="text-green-700 text-xs mt-1">
            {ad.targetUrl || "example.com"}
          </div>
        </div>
      </div>
    </div>
  );

  // Live Chat Component
  const LiveChatPanel = () => (
    <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
          Live Chat Support
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage live chat conversations with users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat List */}
          <div className="space-y-2">
            <h4 className="font-medium text-white mb-2">Active Conversations</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liveChatMessages.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border border-gray-600 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === chat.id ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{chat.username}</p>
                      <p className="text-sm text-gray-300 truncate">{chat.message}</p>
                    </div>
                    <Badge
                      variant={chat.status === 'read' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {chat.status === 'read' ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <h4 className="font-medium text-white mb-4">Chat Response</h4>
            <div className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
              <div className="flex space-x-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Send Response
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                  Mark Resolved
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Server Analytics Component
  const ServerAnalyticsPanel = () => (
    <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
          Server Analytics & Insights
        </CardTitle>
        <CardDescription className="text-gray-400">
          Real-time server performance and growth metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search servers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">
                  <Checkbox
                    checked={selectedServers.length > 0 && serverAnalytics?.every(s => selectedServers.includes(s.serverId))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedServers(serverAnalytics?.map(s => s.serverId) || []);
                      } else {
                        setSelectedServers([]);
                      }
                    }}
                    className="mr-2"
                  />
                  Server
                </TableHead>
                <TableHead className="text-gray-300">Members</TableHead>
                <TableHead className="text-gray-300">Daily Growth</TableHead>
                <TableHead className="text-gray-300">Active Rate</TableHead>
                <TableHead className="text-gray-300">Messages/Day</TableHead>
                <TableHead className="text-gray-300">Join Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serverAnalytics?.map((server) => (
                <TableRow key={server.serverId} className="border-gray-700">
                  <TableCell className="text-white">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedServers.includes(server.serverId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServers([...selectedServers, server.serverId]);
                          } else {
                            setSelectedServers(selectedServers.filter(id => id !== server.serverId));
                          }
                        }}
                        className="mr-2"
                      />
                      {server.serverName}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{server.memberCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`text-sm ${server.dailyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {server.dailyGrowth >= 0 ? '+' : ''}{server.dailyGrowth}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Progress value={server.activeMembers} className="w-16" />
                      <span className="text-xs">{server.activeMembers}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{server.messagesSent.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-300">{server.joinRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Bulk Operations */}
          {selectedServers.length > 0 && (
            <div className="flex space-x-2 mt-4 p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-300">{selectedServers.length} servers selected:</span>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </Button>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                <Settings className="w-4 h-4 mr-1" />
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline" className="border-red-500 text-red-400">
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Ad Performance Analytics Component
  const AdPerformancePanel = () => (
    <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Ad Performance Analytics
        </CardTitle>
        <CardDescription className="text-gray-400">
          Detailed metrics and performance data for advertisements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Ad Title</TableHead>
              <TableHead className="text-gray-300">Impressions</TableHead>
              <TableHead className="text-gray-300">Clicks</TableHead>
              <TableHead className="text-gray-300">CTR</TableHead>
              <TableHead className="text-gray-300">Conversions</TableHead>
              <TableHead className="text-gray-300">Cost</TableHead>
              <TableHead className="text-gray-300">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adsData?.map((ad) => (
              <TableRow key={ad.id} className="border-gray-700">
                <TableCell className="text-white font-medium">{ad.title}</TableCell>
                <TableCell className="text-gray-300">{(ad.impressions || 0).toLocaleString()}</TableCell>
                <TableCell className="text-gray-300">{(ad.clicks || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`text-sm ${(ad.ctr || 0) >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {((ad.ctr || 0) * 100).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-gray-300">{ad.conversions || 0}</TableCell>
                <TableCell className="text-gray-300">${(ad.cost || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Ad Preview</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center p-4">
                        <GoogleAdPreview ad={ad} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="border border-purple-500/20 bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4 text-white">Access Denied</h1>
              <p className="text-gray-300">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Comprehensive platform management with real-time analytics and advanced tools
            </p>

            {/* Live Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-white font-bold">{liveStats?.onlineUsers || 0}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Online Users</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-center space-x-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-bold">{liveStats?.totalServers || 0}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Total Servers</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-bold">{liveStats?.activeAds || 0}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Active Ads</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-center space-x-2">
                  <Bot className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-bold">{liveStats?.botCommands || 0}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Bot Commands/Hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-purple-600">Google Ads</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:bg-purple-600">Servers</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-purple-600">Live Support</TabsTrigger>
            <TabsTrigger value="bot" className="data-[state=active]:bg-purple-600">Bot Control</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-purple-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{liveStats?.totalUsers || 0}</div>
                  <p className="text-xs text-gray-400">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="border border-blue-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Ad Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${liveStats?.adRevenue || 0}</div>
                  <p className="text-xs text-gray-400">+8% from last week</p>
                </CardContent>
              </Card>

              <Card className="border border-green-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Support Tickets</CardTitle>
                  <HeartHandshake className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{liveStats?.supportTickets || 0}</div>
                  <p className="text-xs text-gray-400">5 pending resolution</p>
                </CardContent>
              </Card>

              <Card className="border border-orange-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Bot Uptime</CardTitle>
                  <Shield className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <p className="text-xs text-gray-400">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Frequently used administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-16 flex-col"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    Create Google Ad
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 h-16 flex-col"
                  >
                    <Activity className="w-5 h-5 mb-1" />
                    Live Monitor
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 h-16 flex-col"
                  >
                    <FileText className="w-5 h-5 mb-1" />
                    Export Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 h-16 flex-col"
                  >
                    <Settings className="w-5 h-5 mb-1" />
                    System Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Google-Style Advertisement Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Create and manage Google Ads-style advertisements with professional layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Current Advertisements</h3>
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Google Ad
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create Google-Style Advertisement</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Create professional advertisements with Google Ads appearance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Form */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="ad-title" className="text-gray-300">Headline</Label>
                            <Input
                              id="ad-title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Your compelling headline"
                              className="bg-gray-800 border-gray-600 text-white"
                              maxLength={30}
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.title.length}/30 characters</p>
                          </div>

                          <div>
                            <Label htmlFor="ad-content" className="text-gray-300">Description</Label>
                            <Textarea
                              id="ad-content"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Describe your offer or service"
                              rows={3}
                              className="bg-gray-800 border-gray-600 text-white"
                              maxLength={90}
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/90 characters</p>
                          </div>

                          <div>
                            <Label htmlFor="ad-url" className="text-gray-300">Final URL</Label>
                            <Input
                              id="ad-url"
                              value={formData.targetUrl}
                              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                              placeholder="https://your-website.com"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="ad-image" className="text-gray-300">Image URL (Optional)</Label>
                            <Input
                              id="ad-image"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              placeholder="https://your-image.jpg"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="ad-position" className="text-gray-300">Placement</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, position: value })} value={formData.position}>
                              <SelectTrigger className="bg-gray-800 border-gray-600">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="search-results">Search Results</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="header">Header Banner</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                                <SelectItem value="between-content">Between Content</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Create Advertisement
                          </Button>
                        </div>

                        {/* Live Preview */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-white">Live Preview</h4>
                          <div className="bg-gray-100 p-6 rounded-lg">
                            <GoogleAdPreview ad={formData} />
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>• Headlines should be compelling and under 30 characters</p>
                            <p>• Descriptions should be clear and under 90 characters</p>
                            <p>• Images should be high quality and relevant</p>
                            <p>• URLs should lead to relevant landing pages</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {adsData?.map((ad) => (
                    <div key={ad.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                      <div className="mb-3">
                        <GoogleAdPreview ad={ad} />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-300">
                          <p>CTR: {((ad.ctr || 0) * 100).toFixed(2)}%</p>
                          <p>Clicks: {(ad.clicks || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            {ad.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500 text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdPerformancePanel />
          </TabsContent>

          <TabsContent value="servers" className="space-y-6">
            <ServerAnalyticsPanel />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <LiveChatPanel />

            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-400" />
                  Discord Bot Assistance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Automated Discord bot responses and assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">Bot Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Online Status:</span>
                        <Badge className="bg-green-600">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Commands/Hour:</span>
                        <span className="text-white">{liveStats?.botCommands || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Servers Connected:</span>
                        <span className="text-white">{liveStats?.botServers || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-300">
                        Restart Bot
                      </Button>
                      <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-300">
                        Update Commands
                      </Button>
                      <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-300">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bot" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Discord Bot Control Panel</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage Discord bot settings and monitor performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Bot control interface will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Performance Monitoring</CardTitle>
                <CardDescription className="text-gray-400">
                  System performance metrics and health monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Performance monitoring dashboard coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}