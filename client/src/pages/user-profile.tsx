import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/navbar";
import { User, Briefcase, Layout, Users, Calendar, Shield } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Link } from "wouter";

export default function UserProfilePage() {
  const [, params] = useRoute("/users/:id");
  const userId = params?.id;

  usePageTitle("User Profile");

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch user's jobs
  const { data: jobs = [] } = useQuery({
    queryKey: [`/api/users/${userId}/jobs`],
    enabled: !!userId,
  });

  // Fetch user's templates
  const { data: templates = [] } = useQuery({
    queryKey: [`/api/users/${userId}/templates`],
    enabled: !!userId,
  });

  // Fetch user's partnerships
  const { data: partnerships = [] } = useQuery({
    queryKey: [`/api/users/${userId}/partnerships`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
              <p className="text-gray-400">The user you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = profile.username?.replace(/^.*_/, '') || profile.username;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-24 h-24 border-2 border-purple-400/30" data-testid="img-user-avatar">
                  <AvatarImage
                    src={profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png` : undefined}
                    alt={`${displayName}'s Avatar`}
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-white" data-testid="text-username">
                      {displayName}
                    </h1>
                    {profile.username === "aetherflux_02" && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Discord Member</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" data-testid="text-jobs-count">{jobs.length}</p>
                    <p className="text-sm text-gray-400">Job Postings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Layout className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" data-testid="text-templates-count">{templates.length}</p>
                    <p className="text-sm text-gray-400">Templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white" data-testid="text-partnerships-count">{partnerships.length}</p>
                    <p className="text-sm text-gray-400">Partnerships</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <Tabs defaultValue="jobs" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600" data-testid="tab-jobs">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Jobs
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600" data-testid="tab-templates">
                    <Layout className="w-4 h-4 mr-2" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="partnerships" className="data-[state=active]:bg-green-600" data-testid="tab-partnerships">
                    <Users className="w-4 h-4 mr-2" />
                    Partnerships
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="mt-6 space-y-4">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No job postings yet</p>
                    </div>
                  ) : (
                    jobs.map((job: any) => (
                      <Card key={job.id} className="bg-gray-800 border-gray-700" data-testid={`card-job-${job.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                              <p className="text-sm text-gray-400">{job.company}</p>
                            </div>
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                              {job.type}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{job.description}</p>
                          <Separator className="my-3 bg-gray-700" />
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span>📍 {job.location}</span>
                            <span>💰 {job.salary}</span>
                            <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="templates" className="mt-6 space-y-4">
                  {templates.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No templates yet</p>
                    </div>
                  ) : (
                    templates.map((template: any) => (
                      <Card key={template.id} className="bg-gray-800 border-gray-700" data-testid={`card-template-${template.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                              <p className="text-sm text-gray-400">{template.category}</p>
                            </div>
                            <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                              Template
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{template.description}</p>
                          <Separator className="my-3 bg-gray-700" />
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span>📅 Created {new Date(template.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="partnerships" className="mt-6 space-y-4">
                  {partnerships.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No partnerships yet</p>
                    </div>
                  ) : (
                    partnerships.map((partnership: any) => (
                      <Card key={partnership.id} className="bg-gray-800 border-gray-700" data-testid={`card-partnership-${partnership.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{partnership.title}</h3>
                              <p className="text-sm text-gray-400">{partnership.category}</p>
                            </div>
                            <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                              Partnership
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{partnership.description}</p>
                          <Separator className="my-3 bg-gray-700" />
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span>📅 Posted {new Date(partnership.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
