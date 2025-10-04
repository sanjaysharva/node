
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Edit } from "lucide-react";
import { useLocation } from "wouter";

export default function YourJobs() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "jobs"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/jobs`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-blue-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to view your jobs.</p>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Job Postings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your job listings
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-job")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-blue-400/20 bg-card/50 backdrop-blur-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-blue-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't posted any jobs yet. Start by posting your first job!
              </p>
              <Button
                onClick={() => navigate("/add-job")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job: any) => (
              <Card
                key={job.id}
                className="border-blue-400/20 bg-card/50 backdrop-blur-sm hover:border-blue-400/40 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                      {job.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{job.location}</span>
                    <span className="font-semibold">{job.salary}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-blue-400/30 hover:bg-blue-400/10"
                    onClick={() => navigate(`/jobs/edit/${job.id}`)}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Job
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
