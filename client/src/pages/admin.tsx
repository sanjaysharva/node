import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit, Timer, Upload, Image, Play, Pause, Eye, EyeOff, Zap, TrendingUp, Star, Users, Server, Bot, Calendar, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/navbar";

interface Ad extends Record<string, any> {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string;
  targetPages: string[];
  startDate?: string;
  endDate?: string;
  scheduledTimes?: string[];
  isActive: boolean;
  impressions?: number;
  clicks?: number;
  createdAt?: string;
  type: string;
  duration: number;
  rotationEnabled: boolean;
}

interface Slideshow extends Record<string, any> {
  id: string;
  title: string;
  images: string[];
  autoplay: boolean;
  duration: number;
  position: string;
  targetPages: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

interface FeaturedServer extends Record<string, any> {
  id: string;
  serverId: string;
  serverName: string;
  duration: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  position: string;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: adsData, isLoading: adsLoading, refetch: refetchAds } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
    queryFn: async () => {
      const response = await fetch("/api/ads");
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: blogPosts, isLoading: blogLoading, refetch: refetchBlogPosts } = useQuery<any[]>({
    queryKey: ["/api/blog/posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog/posts");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: slideshowsData, isLoading: slideshowsLoading, refetch: refetchSlideshows } = useQuery<Slideshow[]>({
    queryKey: ["/api/slideshows"],
    queryFn: async () => {
      const response = await fetch("/api/slideshows");
      if (!response.ok) throw new Error("Failed to fetch slideshows");
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: featuredServers, isLoading: featuredLoading, refetch: refetchFeatured } = useQuery<FeaturedServer[]>({
    queryKey: ["/api/admin/featured-servers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/featured-servers");
      if (!response.ok) throw new Error("Failed to fetch featured servers");
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
  const [showFeaturedForm, setShowFeaturedForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [featuredFormData, setFeaturedFormData] = useState({
    serverId: "",
    duration: 24,
    position: "hero"
  });

  const [formData, setFormData] = useState<Omit<Ad, 'id' | 'createdAt' | 'impressions' | 'clicks' | 'isActive'>>({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    position: "header",
    targetPages: ["all"],
    startDate: "",
    endDate: "",
    scheduledTimes: [],
    type: "banner",
    duration: 30,
    rotationEnabled: true,
  });

  // Featured server handlers
  const handleCreateFeaturedServer = async () => {
    if (!featuredFormData.serverId) {
      toast({
        title: "Missing fields",
        description: "Please select a server to feature.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/featured-servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...featuredFormData,
          duration: parseInt(featuredFormData.duration.toString()),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Server featured successfully.",
        });
        setFeaturedFormData({ serverId: "", duration: 24, position: "hero" });
        setShowFeaturedForm(false);
        refetchFeatured();
      } else {
        throw new Error("Failed to feature server");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to feature server.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFeatured = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/featured-servers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Featured server removed.",
        });
        refetchFeatured();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove featured server.",
        variant: "destructive",
      });
    }
  };

  // Other handlers (simplified for brevity)
  const handleCreateAd = async () => {
    if (!formData.title || !formData.content || !formData.position) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const method = editingAd ? "PUT" : "POST";
      const url = editingAd ? `/api/ads/${editingAd.id}` : "/api/ads";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: editingAd ? editingAd.isActive : true,
          duration: parseInt(formData.duration.toString()),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Advertisement ${editingAd ? "updated" : "created"} successfully.`,
        });
        setEditingAd(null);
        setFormData({
          title: "", content: "", imageUrl: "", linkUrl: "", position: "header", targetPages: ["all"],
          startDate: "", endDate: "", scheduledTimes: [], type: "banner", duration: 30, rotationEnabled: true,
        });
        setShowForm(false);
        refetchAds();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save advertisement.",
        variant: "destructive",
      });
    }
  };

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
              Manage your platform with powerful administrative tools and real-time analytics
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-purple-600">Featured</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-purple-600">Ads</TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-purple-600">Blog</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-purple-600">Support</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-purple-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Servers</CardTitle>
                  <Server className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{allServers?.length || 0}</div>
                  <p className="text-xs text-gray-400">Active in platform</p>
                </CardContent>
              </Card>

              <Card className="border border-blue-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Active Ads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{adsData?.filter(ad => ad.isActive).length || 0}</div>
                  <p className="text-xs text-gray-400">Currently running</p>
                </CardContent>
              </Card>

              <Card className="border border-green-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Blog Posts</CardTitle>
                  <MessageCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{blogPosts?.length || 0}</div>
                  <p className="text-xs text-gray-400">Published content</p>
                </CardContent>
              </Card>

              <Card className="border border-orange-500/20 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Featured Servers</CardTitle>
                  <Star className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{featuredServers?.filter(fs => fs.isActive).length || 0}</div>
                  <p className="text-xs text-gray-400">Currently promoted</p>
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
                    onClick={() => setShowFeaturedForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-16 flex-col"
                  >
                    <Star className="w-5 h-5 mb-1" />
                    Feature Server
                  </Button>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 h-16 flex-col"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    Create Ad
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 h-16 flex-col"
                  >
                    <Users className="w-5 h-5 mb-1" />
                    User Stats
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 h-16 flex-col"
                  >
                    <MessageCircle className="w-5 h-5 mb-1" />
                    Support Queue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Featured Server Management</h3>
                <p className="text-gray-400">Promote servers on the homepage for limited time periods</p>
              </div>
              <Dialog open={showFeaturedForm} onOpenChange={setShowFeaturedForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <Star className="w-4 h-4 mr-2" />
                    Feature Server
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Feature a Server</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Promote a server on the homepage for increased visibility
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="server-select" className="text-gray-300">Select Server</Label>
                      <Select onValueChange={(value) => setFeaturedFormData({...featuredFormData, serverId: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue placeholder="Choose a server" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {allServers?.map((server) => (
                            <SelectItem key={server.id} value={server.id}>
                              {server.name} ({server.memberCount} members)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration" className="text-gray-300">Duration (hours)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={featuredFormData.duration}
                          onChange={(e) => setFeaturedFormData({...featuredFormData, duration: parseInt(e.target.value)})}
                          className="bg-gray-800 border-gray-600"
                          min="1"
                          max="168"
                        />
                      </div>
                      <div>
                        <Label htmlFor="position" className="text-gray-300">Position</Label>
                        <Select onValueChange={(value) => setFeaturedFormData({...featuredFormData, position: value})}>
                          <SelectTrigger className="bg-gray-800 border-gray-600">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="hero">Hero Section</SelectItem>
                            <SelectItem value="popular">Popular Servers</SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleCreateFeaturedServer} className="w-full bg-purple-600 hover:bg-purple-700">
                      Feature Server
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Currently Featured Servers</CardTitle>
                <CardDescription className="text-gray-400">
                  Servers currently being promoted on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Server</TableHead>
                      <TableHead className="text-gray-300">Position</TableHead>
                      <TableHead className="text-gray-300">Duration Left</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuredServers?.map((featured) => (
                      <TableRow key={featured.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{featured.serverName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {featured.position}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {Math.max(0, Math.ceil((new Date(featured.endTime).getTime() - Date.now()) / (1000 * 60 * 60)))}h
                        </TableCell>
                        <TableCell>
                          {featured.isActive ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Expired</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFeatured(featured.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!featuredLoading && (!featuredServers || featuredServers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400">
                          No featured servers currently active.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Advertisement Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Create and manage advertisements across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Current Advertisements</h3>
                  <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setEditingAd(null); setFormData({ title: "", content: "", imageUrl: "", linkUrl: "", position: "header", targetPages: ["all"], startDate: "", endDate: "", scheduledTimes: [], type: "banner", duration: 30, rotationEnabled: true }); } setShowForm(open); }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingAd(null); setFormData({ title: "", content: "", imageUrl: "", linkUrl: "", position: "header", targetPages: ["all"], startDate: "", endDate: "", scheduledTimes: [], type: "banner", duration: 30, rotationEnabled: true }); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Ad
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Create or edit advertisements with automatic rotation and timing controls.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ad-title" className="text-gray-300">Title</Label>
                            <Input
                              id="ad-title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Advertisement title"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ad-type" className="text-gray-300">Advertisement Type</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, type: value })} value={formData.type}>
                              <SelectTrigger className="bg-gray-800 border-gray-600">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="banner">Banner</SelectItem>
                                <SelectItem value="popup">Popup Dialog</SelectItem>
                                <SelectItem value="poster">Poster/Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="ad-content" className="text-gray-300">Content</Label>
                          <Textarea
                            id="ad-content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Advertisement content/description"
                            rows={3}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ad-url" className="text-gray-300">Redirect URL</Label>
                            <Input
                              id="ad-url"
                              value={formData.linkUrl}
                              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                              placeholder="https://example.com"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ad-image" className="text-gray-300">Image URL</Label>
                            <Input
                              id="ad-image"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="ad-position" className="text-gray-300">Display Position</Label>
                          <Select onValueChange={(value) => setFormData({ ...formData, position: value })} value={formData.position}>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="header">Header Banner</SelectItem>
                              <SelectItem value="sidebar">Sidebar</SelectItem>
                              <SelectItem value="footer">Footer</SelectItem>
                              <SelectItem value="between-content">Between Content</SelectItem>
                              <SelectItem value="popup">Popup/Modal</SelectItem>
                              <SelectItem value="floating">Floating Corner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ad-duration" className="text-gray-300">Display Duration (seconds)</Label>
                            <Input
                              id="ad-duration"
                              type="number"
                              value={formData.duration}
                              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                              placeholder="30"
                              min="5"
                              max="300"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              How long the ad displays before rotating (5-300 seconds)
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id="ad-rotation"
                              checked={formData.rotationEnabled}
                              onCheckedChange={(checked) => setFormData({ ...formData, rotationEnabled: checked })}
                            />
                            <Label htmlFor="ad-rotation" className="text-gray-300">Enable Auto-Rotation</Label>
                          </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg border border-gray-700">
                          <h4 className="font-medium mb-2 flex items-center text-gray-300">
                            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                            Preview
                          </h4>
                          <div className="border rounded p-3 bg-gray-800">
                            {formData.imageUrl && (
                              <img src={formData.imageUrl} alt="Ad preview" className="w-full h-20 object-cover rounded mb-2" />
                            )}
                            <h5 className="font-medium text-white">{formData.title || "Advertisement Title"}</h5>
                            <p className="text-sm text-gray-400">{formData.content || "Advertisement content will appear here"}</p>
                            {formData.linkUrl && (
                              <div className="flex items-center text-xs text-purple-400 mt-1">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {formData.linkUrl}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button onClick={handleCreateAd} className="w-full bg-purple-600 hover:bg-purple-700">
                          {editingAd ? "Update Advertisement" : "Create Advertisement"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Position</TableHead>
                      <TableHead className="text-gray-300">Duration</TableHead>
                      <TableHead className="text-gray-300">Auto-Rotate</TableHead>
                      <TableHead className="text-gray-300">Active</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adsData?.map((ad: Ad) => (
                      <TableRow key={ad.id} className="border-gray-700">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center space-x-2">
                            {ad.imageUrl && <Image className="w-4 h-4 text-purple-400" />}
                            {ad.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">{ad.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ad.position}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-gray-300">
                            <Timer className="w-3 h-3 text-blue-400" />
                            {ad.duration}s
                          </div>
                        </TableCell>
                        <TableCell>
                          {ad.rotationEnabled ? (
                            <Badge className="bg-green-600">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {ad.isActive ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAd(ad)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAd(ad.id, !ad.isActive)}
                              className={`border-gray-600 hover:bg-gray-700 ${ad.isActive ? 'text-yellow-400' : 'text-green-400'}`}
                            >
                              {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAd(ad.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {adsLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400">Loading advertisements...</TableCell>
                      </TableRow>
                    )}
                    {!adsLoading && adsData?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400">No advertisements found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Blog Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Create and manage blog posts and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Blog Posts</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Blog Post</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Create engaging content for the Smart Serve community.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div>
                          <Label htmlFor="blog-title" className="text-gray-300">Title</Label>
                          <Input
                            id="blog-title"
                            value={blogTitle}
                            onChange={(e) => setBlogTitle(e.target.value)}
                            placeholder="Enter blog post title"
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="blog-excerpt" className="text-gray-300">Excerpt</Label>
                          <Textarea
                            id="blog-excerpt"
                            value={blogExcerpt}
                            onChange={(e) => setBlogExcerpt(e.target.value)}
                            placeholder="Brief description of the post"
                            rows={2}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="blog-category" className="text-gray-300">Category</Label>
                            <Select onValueChange={setBlogCategory} value={blogCategory}>
                              <SelectTrigger className="bg-gray-800 border-gray-600">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="announcements">Announcements</SelectItem>
                                <SelectItem value="tutorials">Tutorials</SelectItem>
                                <SelectItem value="community">Community</SelectItem>
                                <SelectItem value="updates">Platform Updates</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id="blog-featured"
                              checked={blogFeatured}
                              onCheckedChange={setBlogFeatured}
                            />
                            <Label htmlFor="blog-featured" className="text-gray-300">Featured Post</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="blog-content" className="text-gray-300">Content</Label>
                          <Textarea
                            id="blog-content"
                            value={blogContent}
                            onChange={(e) => setBlogContent(e.target.value)}
                            placeholder="Write your blog post content here..."
                            rows={8}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>

                        <Button onClick={handleCreateBlogPost} className="w-full bg-purple-600 hover:bg-purple-700">
                          Create Blog Post
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {blogLoading && <p className="text-muted-foreground">Loading blog posts...</p>}
                  {!blogLoading && blogPosts?.length === 0 && <p className="text-muted-foreground">No blog posts found.</p>}
                  {!blogLoading && blogPosts && blogPosts.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Title</TableHead>
                          <TableHead className="text-gray-300">Category</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts.map((post: any) => (
                          <TableRow key={post.id} className="border-gray-700">
                            <TableCell className="font-medium text-white">{post.title}</TableCell>
                            <TableCell className="text-gray-300">{post.category}</TableCell>
                            <TableCell>
                              {post.featured ? <Badge className="bg-green-600">Featured</Badge> : <Badge variant="secondary">Standard</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Support Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Handle user support requests and community issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Support ticket management will be available here.</p>
                  <p className="text-sm text-gray-400">
                    Tickets are automatically forwarded to Discord DMs for quick response.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage platform users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">User management interface...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}