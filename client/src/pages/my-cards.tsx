import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Server, Briefcase, Handshake, FileText, Calendar, Bot, Edit, Eye, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";

export default function MyCards() {
  const { user, isAuthenticated } = useAuth();
  
  usePageTitle("My Cards");

  // Fetch all user content
  const { data: servers, isLoading: serversLoading } = useQuery({
    queryKey: ["/api/servers/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/servers/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch servers");
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/jobs/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const { data: partnerships, isLoading: partnershipsLoading } = useQuery({
    queryKey: ["/api/partnerships/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/partnerships/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch partnerships");
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/templates/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/events/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const { data: bots, isLoading: botsLoading } = useQuery({
    queryKey: ["/api/bots/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/bots/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch bots");
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4 text-white">Access Denied</h1>
              <p className="text-gray-400">You need to be logged in to view your cards.</p>
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Cards</h1>
              <p className="text-gray-400">Manage all your content in one place</p>
            </div>
          </div>

          {/* Tabs for different content types */}
          <Tabs defaultValue="servers" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-900 border-gray-800">
              <TabsTrigger value="servers" className="data-[state=active]:bg-purple-600">
                <Server className="w-4 h-4 mr-2" />
                Servers {servers && `(${servers.length})`}
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-purple-600">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs {jobs && `(${jobs.length})`}
              </TabsTrigger>
              <TabsTrigger value="partnerships" className="data-[state=active]:bg-purple-600">
                <Handshake className="w-4 h-4 mr-2" />
                Partnerships {partnerships && `(${partnerships.length})`}
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
                <FileText className="w-4 h-4 mr-2" />
                Templates {templates && `(${templates.length})`}
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
                <Calendar className="w-4 h-4 mr-2" />
                Events {events && `(${events.length})`}
              </TabsTrigger>
              <TabsTrigger value="bots" className="data-[state=active]:bg-purple-600">
                <Bot className="w-4 h-4 mr-2" />
                Bots {bots && `(${bots.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Servers Tab */}
            <TabsContent value="servers" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Servers</h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/add-server">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Server
                  </Link>
                </Button>
              </div>
              
              {serversLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : servers && servers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servers.map((server: any) => (
                    <Card key={server.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-2">{server.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{server.shortDescription || server.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary">{server.category}</Badge>
                          {server.verified && <Badge className="bg-blue-600">Verified</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/server/${server.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/servers/edit/${server.id}`}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Servers Yet</h3>
                    <p className="text-gray-400 mb-6">Start by adding your first server to the platform</p>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/add-server">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Server
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Jobs</h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/add-job">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Job
                  </Link>
                </Button>
              </div>

              {jobsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {jobs.map((job: any) => (
                    <Card key={job.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-white text-lg">{job.title}</h3>
                              <Badge variant="secondary">{job.type}</Badge>
                              {job.salaryRange && <Badge className="bg-green-600">{job.salaryRange}</Badge>}
                            </div>
                            <p className="text-gray-400 mb-4">{job.company}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/jobs#${job.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Link href={`/jobs/edit/${job.id}`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Jobs Posted</h3>
                    <p className="text-gray-400 mb-6">Create your first job listing</p>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/add-job">
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Job
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Partnerships Tab */}
            <TabsContent value="partnerships" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Partnerships</h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/add-partnership">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Partnership
                  </Link>
                </Button>
              </div>

              {partnershipsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : partnerships && partnerships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerships.map((partnership: any) => (
                    <Card key={partnership.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-white mb-2">{partnership.title}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-3">{partnership.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary">{partnership.type}</Badge>
                          <Badge className="bg-blue-600">{partnership.status}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/partnership#${partnership.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/partnerships/edit/${partnership.id}`}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Handshake className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Partnerships Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first partnership opportunity</p>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/add-partnership">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Partnership
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Templates</h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/add-template">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Link>
                </Button>
              </div>

              {templatesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template: any) => (
                    <Card key={template.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-white mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/template/${template.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/templates/edit/${template.id}`}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Templates Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first server template</p>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/add-template">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Template
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Events</h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/add-event">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Link>
                </Button>
              </div>

              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event: any) => (
                    <Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-white mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/events#${event.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/events/edit/${event.id}`}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Events Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first event</p>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/add-event">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Event
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bots Tab */}
            <TabsContent value="bots" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Bots</h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/add-bot">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bot
                  </Link>
                </Button>
              </div>

              {botsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : bots && bots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bots.map((bot: any) => (
                    <Card key={bot.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-white mb-2">{bot.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{bot.shortDescription || bot.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary">{bot.category}</Badge>
                          {bot.verified && <Badge className="bg-blue-600">Verified</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/bot/${bot.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/bots/edit/${bot.id}`}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Bots Yet</h3>
                    <p className="text-gray-400 mb-6">Add your first Discord bot</p>
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/add-bot">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Bot
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
