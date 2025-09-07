
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Ad {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    position: "header",
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

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAds();
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel - Ad Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Ad
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingAd ? "Edit Advertisement" : "Create New Advertisement"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="linkUrl">Link URL (optional)</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="between-content">Between Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingAd ? "Update Ad" : "Create Ad"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                    setFormData({
                      title: "",
                      content: "",
                      imageUrl: "",
                      linkUrl: "",
                      position: "header",
                      isActive: true,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{ad.title}</h3>
                  <p className="text-gray-600 mb-2">{ad.content}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Position: {ad.position}</span>
                    <span>Status: {ad.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    position: "header"
  });

  // Check if user is admin
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const { data: ads, isLoading } = useQuery({
    queryKey: ["/api/ads"],
  });

  const createAdMutation = useMutation({
    mutationFn: async (adData: typeof newAd) => {
      const response = await apiRequest("POST", "/api/ads", adData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      setNewAd({
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        position: "header"
      });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
    },
  });

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAd.title && newAd.linkUrl) {
      createAdMutation.mutate(newAd);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Create New Ad */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Ad
            </CardTitle>
            <CardDescription>
              Add advertisements to any area of the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    placeholder="Ad title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={newAd.position} 
                    onValueChange={(value) => setNewAd({ ...newAd, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="between-content">Between Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  placeholder="Ad description (optional)"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newAd.imageUrl}
                  onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg (optional)"
                />
              </div>
              
              <div>
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  value={newAd.linkUrl}
                  onChange={(e) => setNewAd({ ...newAd, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <Button type="submit" disabled={createAdMutation.isPending}>
                {createAdMutation.isPending ? "Creating..." : "Create Ad"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Ads</CardTitle>
            <CardDescription>
              Current advertisements on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading ads...</p>
            ) : ads && ads.length > 0 ? (
              <div className="space-y-4">
                {ads.map((ad: Ad) => (
                  <div key={ad.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{ad.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {ad.position}
                        </span>
                        <span className={`px-2 py-1 rounded ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {ad.imageUrl && (
                        <img src={ad.imageUrl} alt={ad.title} className="mt-2 h-16 w-auto object-contain" />
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAdMutation.mutate(ad.id)}
                      disabled={deleteAdMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No ads created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
