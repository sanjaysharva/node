import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle, 
  MessageCircle, 
  Users, 
  BookOpen, 
  Search, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle, 
  Image as ImageIcon,
  X,
  Upload
} from "lucide-react";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  images?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  status: 'open' | 'solved' | 'closed';
  replies: CommunityReply[];
}

interface CommunityReply {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  images?: string[];
  createdAt: string;
  upvotes: number;
  downvotes: number;
  isSolution: boolean;
}

// Interface for Ads - Added missing properties based on the provided changes
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
  ctr?: number;
  conversions?: number;
  cost?: number;
}

export default function HelpCenter() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Form states for community posts
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });

  // Fetch community posts
  const { data: communityPosts, isLoading: postsLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/community/posts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
      setPostData({ title: "", content: "", category: "", tags: "" });
      setSelectedImages([]);
      setShowCreatePost(false);
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!postData.title || !postData.content || !postData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('category', postData.category);
    formData.append('tags', postData.tags);

    selectedImages.forEach(image => {
      formData.append('images', image);
    });

    createPostMutation.mutate(formData);
  };

  const categories = [
    { value: "general", label: "General Help", icon: HelpCircle, color: "blue" },
    { value: "technical", label: "Technical Issues", icon: BookOpen, color: "red" },
    { value: "discord", label: "Discord Related", icon: MessageCircle, color: "purple" },
    { value: "server-setup", label: "Server Setup", icon: Users, color: "green" },
  ];

  // Note: The original code did not contain any state or logic related to the 'Ad' interface. 
  // The 'formData' state and its usage were also not present in the original code snippet provided.
  // Therefore, the following additions are based on the assumption that this was intended 
  // for a separate feature or was a remnant of a previous change that wasn't fully integrated.
  // For the purpose of fulfilling the request to fix errors and missing properties based on the changes,
  // I've included the 'Ad' interface and a placeholder 'formData' state as described in the changes.
  
  // State for Ad management (added based on changes)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Help & Community Center
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Get help from our community, share solutions, and solve problems together
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for help topics, solutions, or ask a question..."
                  className="pl-12 h-14 text-lg bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="community" className="data-[state=active]:bg-purple-600">Community Help</TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-purple-600">FAQ</TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-purple-600">Guides</TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-purple-600">Contact Support</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            {/* Category Filter and Create Post */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-purple-600" : "border-gray-600 text-gray-300"}
                >
                  All Categories
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={selectedCategory === cat.value ? "bg-purple-600" : "border-gray-600 text-gray-300"}
                  >
                    <cat.icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </Button>
                ))}
              </div>

              {isAuthenticated && (
                <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Ask for Help
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Ask the Community</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Describe your problem and get help from other community members
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div>
                        <Label htmlFor="post-title" className="text-gray-300">Title</Label>
                        <Input
                          id="post-title"
                          placeholder="Briefly describe your problem..."
                          value={postData.title}
                          onChange={(e) => setPostData({...postData, title: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="post-category" className="text-gray-300">Category</Label>
                          <Select onValueChange={(value) => setPostData({...postData, category: value})}>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="post-tags" className="text-gray-300">Tags (optional)</Label>
                          <Input
                            id="post-tags"
                            placeholder="discord, bot, setup..."
                            value={postData.tags}
                            onChange={(e) => setPostData({...postData, tags: e.target.value})}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="post-content" className="text-gray-300">Description</Label>
                        <Textarea
                          id="post-content"
                          placeholder="Provide detailed information about your problem..."
                          rows={6}
                          value={postData.content}
                          onChange={(e) => setPostData({...postData, content: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label className="text-gray-300">Images (optional)</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-700 text-gray-300"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Add Images
                          </label>
                        </div>

                        {selectedImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {selectedImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border border-gray-600"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={handleCreatePost} 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={createPostMutation.isPending}
                      >
                        {createPostMutation.isPending ? "Creating..." : "Ask for Help"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Community Posts */}
            <div className="space-y-4">
              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="border border-gray-700 bg-gray-900/50">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-700 rounded w-full"></div>
                          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : communityPosts && communityPosts.length > 0 ? (
                communityPosts.map((post) => (
                  <Card key={post.id} className="border border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-gray-300 font-medium">{post.author.username}</span>
                            <Badge variant="outline" className={`border-${categories.find(c => c.value === post.category)?.color}-500 text-${categories.find(c => c.value === post.category)?.color}-400`}>
                              {categories.find(c => c.value === post.category)?.label}
                            </Badge>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                          <p className="text-gray-300 mb-3 line-clamp-2">{post.content}</p>

                          {post.images && post.images.length > 0 && (
                            <div className="flex space-x-2 mb-3">
                              {post.images.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Post image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-600"
                                />
                              ))}
                              {post.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-gray-400 text-sm">
                                  +{post.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-green-400">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {post.upvotes}
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                {post.downvotes}
                              </Button>
                            </div>
                            <div className="flex items-center text-gray-400">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.replies.length} replies
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <Badge 
                            variant={post.status === 'solved' ? 'default' : 'secondary'}
                            className={post.status === 'solved' ? 'bg-green-600' : ''}
                          >
                            {post.status === 'solved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border border-gray-700 bg-gray-900/50">
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery || selectedCategory !== 'all' 
                        ? "Try adjusting your search or category filter"
                        : "Be the first to ask for help!"
                      }
                    </p>
                    {isAuthenticated && (
                      <Button 
                        onClick={() => setShowCreatePost(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Ask for Help
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-gray-400">
                  Common questions and answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">FAQ content will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <Card className="border border-gray-700 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Help Guides</CardTitle>
                <CardDescription className="text-gray-400">
                  Step-by-step guides and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Guide content will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            {/* Live Chat Support */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border border-gray-700 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-green-400" />
                    Live Chat Support
                    <div className="ml-auto flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get instant help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-64 bg-gray-800 rounded-lg p-4 overflow-y-auto border border-gray-600">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-robot text-white text-sm"></i>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                            <p className="text-white text-sm">Hello! I'm here to help. What can I assist you with today?</p>
                            <span className="text-xs text-gray-400">Just now</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Type your message..."
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <i className="fas fa-paper-plane"></i>
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        Server Issues
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        Bot Problems
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        Account Help
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-700 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fab fa-discord mr-2 text-purple-400"></i>
                    Discord Bot Assistant
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get help from our Discord bot with real-time monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Bot Status */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">Bot Status</h4>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm text-green-400">Operational</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-white ml-2">99.9%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Response:</span>
                          <span className="text-white ml-2">45ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Servers:</span>
                          <span className="text-white ml-2">1,247</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Commands:</span>
                          <span className="text-white ml-2">156/min</span>
                        </div>
                      </div>
                    </div>

                    {/* Bot Commands */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Quick Commands</h4>
                      <div className="space-y-2">
                        <div className="bg-gray-800 rounded p-3 border border-gray-600">
                          <code className="text-blue-400">/help server-setup</code>
                          <p className="text-gray-400 text-sm mt-1">Get help with setting up your server</p>
                        </div>
                        <div className="bg-gray-800 rounded p-3 border border-gray-600">
                          <code className="text-blue-400">/support ticket</code>
                          <p className="text-gray-400 text-sm mt-1">Create a support ticket</p>
                        </div>
                        <div className="bg-gray-800 rounded p-3 border border-gray-600">
                          <code className="text-blue-400">/status check</code>
                          <p className="text-gray-400 text-sm mt-1">Check bot and server status</p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <i className="fab fa-discord mr-2"></i>
                      Invite Bot to Server
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Ticket Management */}
            <Card className="border border-gray-700 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <i className="fas fa-ticket-alt mr-2 text-yellow-400"></i>
                  Support Ticket Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track and manage your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Create Ticket */}
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <div>
                      <h4 className="text-white font-medium">Need Help?</h4>
                      <p className="text-gray-400 text-sm">Create a support ticket for detailed assistance</p>
                    </div>
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  </div>

                  {/* Ticket List */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Your Tickets</h4>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">#12345 - Bot Configuration Issue</span>
                        <Badge className="bg-yellow-600">In Progress</Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Need help setting up moderation bot...</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created 2 hours ago</span>
                        <span>Last updated 30 min ago</span>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">#12344 - Server Verification</span>
                        <Badge className="bg-green-600">Resolved</Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Questions about server verification process...</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created yesterday</span>
                        <span>Resolved 4 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Automated Response System */}
            <Card className="border border-gray-700 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <i className="fas fa-magic mr-2 text-blue-400"></i>
                  Automated Bot Response System
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get instant answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Common Issues</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        How to add bot to server?
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Bot not responding to commands
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Permission setup guide
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Server verification process
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Response Statistics</h4>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Average Response Time</span>
                          <span className="text-white">< 1 second</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Success Rate</span>
                          <span className="text-white">94.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Questions Answered Today</span>
                          <span className="text-white">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">User Satisfaction</span>
                          <span className="text-white">4.7/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}