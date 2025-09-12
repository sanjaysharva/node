import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit, Calendar, Clock, Upload, Image, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import {
  Users,
  Server,
  Bot,
  TrendingUp,
  Eye,
  EyeOff,
  Timer,
  ExternalLink,
  Zap
} from "lucide-react";

interface Ad {
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

interface Slideshow {
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

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'slideshows'>('ads');
  const [showForm, setShowForm] = useState(false);
  const [showSlideshowForm, setShowSlideshowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [editingSlideshow, setEditingSlideshow] = useState<Slideshow | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    position: "header",
    targetPages: ["all"],
    startDate: "",
    endDate: "",
    scheduledTimes: [],
    isActive: true,
  });

  const [slideshowFormData, setSlideshowFormData] = useState({
    title: "",
    images: [""],
    autoplay: true,
    duration: 5,
    position: "hero",
    targetPages: ["all"],
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/ads");
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    }
  };

  const fetchSlideshows = async () => {
    try {
      const response = await fetch("/api/slideshows");
      if (response.ok) {
        const data = await response.json();
        setSlideshows(data);
      }
    } catch (error) {
      console.error("Failed to fetch slideshows:", error);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAds();
      fetchSlideshows();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAd ? `/api/ads/${editingAd.id}` : "/api/ads";
      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingAd ? "Ad updated" : "Ad created",
          description: "The advertisement has been saved successfully.",
        });
        setShowForm(false);
        setEditingAd(null);
        setFormData({
          title: "",
          content: "",
          imageUrl: "",
          linkUrl: "",
          position: "header",
          targetPages: ["all"],
          startDate: "",
          endDate: "",
          scheduledTimes: [],
          isActive: true,
        });
        fetchAds();
      } else {
        throw new Error("Failed to save ad");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the advertisement.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content,
      imageUrl: ad.imageUrl || "",
      linkUrl: ad.linkUrl || "",
      position: ad.position,
      targetPages: ad.targetPages || ["all"],
      startDate: ad.startDate || "",
      endDate: ad.endDate || "",
      scheduledTimes: ad.scheduledTimes || [],
      isActive: ad.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Ad deleted",
          description: "The advertisement has been removed.",
        });
        fetchAds();
      } else {
        throw new Error("Failed to delete ad");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the advertisement.",
        variant: "destructive",
      });
    }
  };

  const handleSlideshowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSlideshow ? `/api/slideshows/${editingSlideshow.id}` : "/api/slideshows";
      const method = editingSlideshow ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slideshowFormData),
      });

      if (response.ok) {
        toast({
          title: editingSlideshow ? "Slideshow updated" : "Slideshow created",
          description: "The slideshow has been saved successfully.",
        });
        setShowSlideshowForm(false);
        setEditingSlideshow(null);
        setSlideshowFormData({
          title: "",
          images: [""],
          autoplay: true,
          duration: 5,
          position: "hero",
          targetPages: ["all"],
          startDate: "",
          endDate: "",
          isActive: true,
        });
        fetchSlideshows();
      } else {
        throw new Error("Failed to save slideshow");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the slideshow.",
        variant: "destructive",
      });
    }
  };

  const handleSlideshowEdit = (slideshow: Slideshow) => {
    setEditingSlideshow(slideshow);
    setSlideshowFormData({
      title: slideshow.title,
      images: slideshow.images,
      autoplay: slideshow.autoplay,
      duration: slideshow.duration,
      position: slideshow.position,
      targetPages: slideshow.targetPages,
      startDate: slideshow.startDate || "",
      endDate: slideshow.endDate || "",
      isActive: slideshow.isActive,
    });
    setShowSlideshowForm(true);
  };

  const handleSlideshowDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/slideshows/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Slideshow deleted",
          description: "The slideshow has been removed.",
        });
        fetchSlideshows();
      } else {
        throw new Error("Failed to delete slideshow");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the slideshow.",
        variant: "destructive",
      });
    }
  };

  const addImageToSlideshow = () => {
    setSlideshowFormData({
      ...slideshowFormData,
      images: [...slideshowFormData.images, ""]
    });
  };

  const removeImageFromSlideshow = (index: number) => {
    const newImages = slideshowFormData.images.filter((_, i) => i !== index);
    setSlideshowFormData({
      ...slideshowFormData,
      images: newImages.length > 0 ? newImages : [""]
    });
  };

  const updateSlideshowImage = (index: number, value: string) => {
    const newImages = [...slideshowFormData.images];
    newImages[index] = value;
    setSlideshowFormData({
      ...slideshowFormData,
      images: newImages
    });
  };

  const [adTitle, setAdTitle] = useState("");
  const [adContent, setAdContent] = useState("");
  const [adPosition, setAdPosition] = useState("");
  const [adUrl, setAdUrl] = useState("");
  const [adImage, setAdImage] = useState("");
  const [adType, setAdType] = useState("banner");
  const [adDuration, setAdDuration] = useState("30");
  const [adRotationEnabled, setAdRotationEnabled] = useState(true);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogFeatured, setBlogFeatured] = useState(false);
  const queryClient = useQueryClient();


  const handleCreateAd = async () => {
    if (!adTitle || !adContent || !adPosition) {
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
          title: adTitle,
          content: adContent,
          position: adPosition,
          url: adUrl,
          imageUrl: adImage,
          type: adType,
          duration: parseInt(adDuration),
          rotationEnabled: adRotationEnabled,
          active: true,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Advertisement ${editingAd ? "updated" : "created"} successfully.`,
        });
        setAdTitle("");
        setAdContent("");
        setAdPosition("");
        setAdUrl("");
        setAdImage("");
        setAdType("banner");
        setAdDuration("30");
        setAdRotationEnabled(true);
        setEditingAd(null);
        queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      } else {
        throw new Error("Failed to save advertisement");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save advertisement.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBlogPost = async () => {
    if (!blogTitle || !blogContent || !blogCategory) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogTitle,
          content: blogContent,
          excerpt: blogExcerpt,
          category: blogCategory,
          featured: blogFeatured,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog post created successfully.",
        });
        setBlogTitle("");
        setBlogContent("");
        setBlogExcerpt("");
        setBlogCategory("");
        setBlogFeatured(false);
        queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      } else {
        throw new Error("Failed to create blog post");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post.",
        variant: "destructive",
      });
    }
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdContent(ad.content);
    setAdPosition(ad.position);
    setAdUrl(ad.linkUrl || "");
    setAdImage(ad.imageUrl || "");
    setAdType(ad.type);
    setAdDuration(ad.duration?.toString() || "30");
    setAdRotationEnabled(ad.rotationEnabled);
  };

  const handleToggleAd = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Advertisement ${active ? "activated" : "deactivated"} successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      } else {
        throw new Error("Failed to update ad status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ad status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const response = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Advertisement deleted successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      } else {
        throw new Error("Failed to delete ad");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete advertisement.",
        variant: "destructive",
      });
    }
  };


  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Navbar />
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads">Advertisements</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, Administrator!</CardTitle>
              <CardDescription>Dashboard overview and quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ads.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Blog Posts</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">N/A</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">N/A</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Advertisement Management</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAd(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</DialogTitle>
                  <DialogDescription>
                    Create or edit advertisements with automatic rotation and timing controls.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad-title">Title</Label>
                      <Input
                        id="ad-title"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="Advertisement title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-type">Advertisement Type</Label>
                      <Select onValueChange={setAdType} value={adType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="popup">Popup Dialog</SelectItem>
                          <SelectItem value="poster">Poster/Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ad-content">Content</Label>
                    <Textarea
                      id="ad-content"
                      value={adContent}
                      onChange={(e) => setAdContent(e.target.value)}
                      placeholder="Advertisement content/description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad-url">Redirect URL</Label>
                      <Input
                        id="ad-url"
                        value={adUrl}
                        onChange={(e) => setAdUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-image">Image URL</Label>
                      <Input
                        id="ad-image"
                        value={adImage}
                        onChange={(e) => setAdImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ad-position">Display Position</Label>
                    <Select onValueChange={setAdPosition} value={adPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
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
                      <Label htmlFor="ad-duration">Display Duration (seconds)</Label>
                      <Input
                        id="ad-duration"
                        type="number"
                        value={adDuration}
                        onChange={(e) => setAdDuration(e.target.value)}
                        placeholder="30"
                        min="5"
                        max="300"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        How long the ad displays before rotating (5-300 seconds)
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="ad-rotation"
                        checked={adRotationEnabled}
                        onCheckedChange={setAdRotationEnabled}
                      />
                      <Label htmlFor="ad-rotation">Enable Auto-Rotation</Label>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Preview
                    </h4>
                    <div className="border rounded p-3 bg-background">
                      {adImage && (
                        <img src={adImage} alt="Ad preview" className="w-full h-20 object-cover rounded mb-2" />
                      )}
                      <h5 className="font-medium">{adTitle || "Advertisement Title"}</h5>
                      <p className="text-sm text-muted-foreground">{adContent || "Advertisement content will appear here"}</p>
                      {adUrl && (
                        <div className="flex items-center text-xs text-primary mt-1">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {adUrl}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleCreateAd} className="w-full">
                    {editingAd ? "Update Advertisement" : "Create Advertisement"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Advertisements</CardTitle>
              <CardDescription>Manage advertisements with automatic rotation and timing controls</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Auto-Rotate</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads?.map((ad: any) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {ad.imageUrl && <Image className="w-4 h-4" />}
                          {ad.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ad.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ad.position}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Timer className="w-3 h-3" />
                          {ad.duration || 30}s
                        </div>
                      </TableCell>
                      <TableCell>
                        {ad.rotationEnabled ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {ad.active ? (
                          <Badge variant="default">Active</Badge>
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
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAd(ad.id, !ad.active)}
                          >
                            {ad.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAd(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Blog Management</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                  <DialogDescription>
                    Create engaging content for the Smart Serve community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="blog-title">Title</Label>
                    <Input
                      id="blog-title"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="Enter blog post title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blog-excerpt">Excerpt</Label>
                    <Textarea
                      id="blog-excerpt"
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      placeholder="Brief description of the post"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blog-category">Category</Label>
                      <Select onValueChange={setBlogCategory} value={blogCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="blog-featured">Featured Post</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="blog-content">Content</Label>
                    <Textarea
                      id="blog-content"
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      placeholder="Write your blog post content here..."
                      rows={8}
                    />
                  </div>

                  <Button onClick={handleCreateBlogPost} className="w-full">
                    Create Blog Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>Manage blog posts and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Blog management functionality will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Support Tickets</h3>
            <Badge variant="outline">Auto-refresh: 30s</Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>Manage user support requests and Discord DM integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Support ticket management will be available here.</p>
                <p className="text-sm text-muted-foreground">
                  Tickets are automatically forwarded to Discord DMs for quick response.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">User management functionality will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}