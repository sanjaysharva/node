
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout, Plus, Edit } from "lucide-react";
import { useLocation } from "wouter";

export default function YourTemplates() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "templates"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/templates`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to view your templates.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Server Templates
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your Discord server templates
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-template")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-purple-400/20 bg-card/50 backdrop-blur-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any templates yet. Start by adding your first template!
              </p>
              <Button
                onClick={() => navigate("/add-template")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => (
              <Card
                key={template.id}
                className="border-purple-400/20 bg-card/50 backdrop-blur-sm hover:border-purple-400/40 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.description}
                  </p>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-purple-400/30 hover:bg-purple-400/10"
                    onClick={() => navigate(`/templates/edit/${template.id}`)}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
