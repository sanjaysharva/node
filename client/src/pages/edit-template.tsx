import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { usePageTitle } from "@/hooks/use-page-title";
import { Layout, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function EditTemplatePage() {
  const [, params] = useRoute("/templates/edit/:id");
  const [, navigate] = useLocation();
  const templateId = params?.id;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  usePageTitle("Edit Template");

  // Fetch template data
  const { data: template, isLoading } = useQuery({
    queryKey: [`/api/templates/${templateId}`],
    enabled: !!templateId,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        category: template.category || "",
      });
    }
  }, [template]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/templates/${templateId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      queryClient.invalidateQueries({ queryKey: [`/api/templates/${templateId}`] });
      toast({
        title: "Success",
        description: "Template updated successfully!",
      });
      navigate("/server-templates");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });
      navigate("/server-templates");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
              <p className="text-gray-400">You need to be logged in to edit templates.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!template || template.ownerId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Not Found</h1>
              <p className="text-gray-400">This template doesn't exist or you don't have permission to edit it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/server-templates">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Edit Template</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your server template details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Gaming Community Template"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                    data-testid="input-name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Gaming"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                    data-testid="input-category"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your server template..."
                    className="mt-2 bg-gray-800 border-gray-700 text-white min-h-[150px]"
                    data-testid="textarea-description"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    data-testid="button-update"
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Template"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                    data-testid="button-delete"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Template"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
