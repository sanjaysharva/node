
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Hash, Shield, Users, Copy, Loader2, ExternalLink } from "lucide-react";

interface TemplateData {
  channels: any[];
  roles: any[];
  serverName: string;
  serverIcon: string;
}

export default function AddTemplate() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    serverLink: "",
  });
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const categories = [
    "gaming", "community", "business", "education", 
    "creative", "roleplay", "support", "other"
  ];

  const analyzeServer = async () => {
    if (!formData.serverLink) {
      toast({
        title: "Server link required",
        description: "Please enter a Discord server invite link",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/templates/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverLink: formData.serverLink }),
      });

      if (!response.ok) throw new Error("Failed to analyze server");
      const data = await response.json();
      setTemplateData(data);
      setFormData(prev => ({ 
        ...prev, 
        name: prev.name || `${data.serverName} Template` 
      }));
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze server. Make sure the bot has access to your server.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (templateInfo: any) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateInfo),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLink(data.templateLink);
      toast({
        title: "Template created successfully!",
        description: "Your template is now available for others to use.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create template",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to create templates.",
        variant: "destructive",
      });
      return;
    }

    if (!templateData) {
      toast({
        title: "Server analysis required",
        description: "Please analyze your server first.",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate({
      ...formData,
      channels: templateData.channels,
      roles: templateData.roles,
      previewImage: templateData.serverIcon,
    });
  };

  const copyTemplateLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Template link copied!",
      description: "Share this link or use it with /addtemplate command",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please login with Discord to create server templates.
            </p>
            <Button onClick={() => window.location.href = "/api/auth/discord"}>
              Login with Discord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Create Server Template
            </h1>
            <p className="text-xl text-muted-foreground">
              Turn your Discord server into a reusable template for others to copy
            </p>
          </div>

          {generatedLink ? (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Template Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your template "{formData.name}" has been created and is now available for others to use.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <Label className="text-sm font-medium">Template Link:</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 p-2 bg-background border rounded text-sm">
                      {generatedLink}
                    </code>
                    <Button size="sm" onClick={copyTemplateLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="font-medium text-blue-400 mb-2">How to use:</h4>
                  <p className="text-sm text-muted-foreground">
                    Users can copy this template to their server by using the command:
                  </p>
                  <code className="block mt-2 p-2 bg-background border rounded text-sm">
                    /addtemplate {generatedLink}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/server-templates'}>
                    View All Templates
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Server Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Analyze Your Server</CardTitle>
                  <CardDescription>
                    Enter your Discord server invite link to analyze its structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverLink">Discord Server Invite Link</Label>
                    <div className="flex gap-2">
                      <Input
                        id="serverLink"
                        placeholder="https://discord.gg/your-invite-code"
                        value={formData.serverLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, serverLink: e.target.value }))}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={analyzeServer}
                        disabled={isAnalyzing || !formData.serverLink}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Analyze"
                        )}
                      </Button>
                    </div>
                  </div>

                  {templateData && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium mb-3">Server Structure Preview:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Channels ({templateData.channels?.length || 0})</span>
                          </div>
                          <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                            {templateData.channels?.slice(0, 5).map((channel: any, idx: number) => (
                              <div key={idx} className="py-1">
                                {channel.type === 'category' ? (
                                  <span className="uppercase font-medium">📁 {channel.name}</span>
                                ) : (
                                  <span className="ml-4">
                                    {channel.type === 'voice' ? '🔊' : '#'} {channel.name}
                                  </span>
                                )}
                              </div>
                            ))}
                            {templateData.channels?.length > 5 && (
                              <div className="text-xs">...and {templateData.channels.length - 5} more</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="font-medium">Roles ({templateData.roles?.length || 0})</span>
                          </div>
                          <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                            {templateData.roles?.slice(0, 5).map((role: any, idx: number) => (
                              <div key={idx} className="py-1 flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: role.color || '#99aab5' }}
                                />
                                {role.name}
                              </div>
                            ))}
                            {templateData.roles?.length > 5 && (
                              <div className="text-xs">...and {templateData.roles.length - 5} more</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Template Information */}
              <Card>
                <CardHeader>
                  <CardTitle>2. Template Information</CardTitle>
                  <CardDescription>
                    Provide details about your template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        placeholder="Gaming Community Template"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="A comprehensive gaming server template with organized channels for different game types, voice channels for team coordination, and moderation roles."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={!templateData || createTemplateMutation.isPending}
                  className="flex-1"
                >
                  {createTemplateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create Template
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => window.location.href = '/server-templates'}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Search, Hash, Shield, CheckCircle } from "lucide-react";

const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  serverLink: z.string().min(1, "Server link is required"),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface ServerAnalysis {
  serverName: string;
  serverIcon: string;
  channels: any[];
  roles: any[];
}

export default function AddTemplate() {
  const [serverAnalysis, setServerAnalysis] = useState<ServerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      serverLink: "",
    },
  });

  const categories = [
    { value: "gaming", label: "Gaming" },
    { value: "community", label: "Community" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "creative", label: "Creative" },
    { value: "roleplay", label: "Roleplay" },
    { value: "support", label: "Support" },
  ];

  const analyzeServer = async () => {
    const serverLink = form.getValues("serverLink");
    if (!serverLink) {
      toast({
        title: "Server link required",
        description: "Please enter a Discord server invite link to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("/api/templates/analyze", "POST", {
        serverLink,
      });

      if (!response.ok) throw new Error("Failed to analyze server");
      const data = await response.json();
      
      setServerAnalysis(data);
      form.setValue("name", `${data.serverName} Template`);

      toast({
        title: "Server analyzed successfully",
        description: `Found ${data.channels.length} channels and ${data.roles.length} roles`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze server. Make sure the invite link is valid and the bot has access.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await apiRequest("/api/templates", "POST", {
        ...data,
        channels: serverAnalysis?.channels || [],
        roles: serverAnalysis?.roles || [],
        previewImage: serverAnalysis?.serverIcon,
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template created successfully",
        description: "Your server template has been created and is now available.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setTimeout(() => {
        window.location.href = "/server-templates";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to create a template.",
        variant: "destructive",
      });
      return;
    }

    if (!serverAnalysis) {
      toast({
        title: "Server analysis required",
        description: "Please analyze your server first.",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please login to create a server template.
            </p>
            <Button onClick={() => window.location.href = "/login"}>
              Login to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/server-templates"}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Server Template</h1>
              <p className="text-muted-foreground">
                Create a reusable template from your Discord server
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Server Analysis</CardTitle>
                  <CardDescription>
                    Enter your Discord server invite link to analyze the structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="serverLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Server Invite Link</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="https://discord.gg/your-invite-code"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={analyzeServer}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <Search className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Search className="w-4 h-4 mr-2" />
                            )}
                            Analyze
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serverAnalysis && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={serverAnalysis.serverIcon}
                          alt="Server Icon"
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{serverAnalysis.serverName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Hash className="w-4 h-4" />
                              <span>{serverAnalysis.channels.length} channels</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Shield className="w-4 h-4" />
                              <span>{serverAnalysis.roles.length} roles</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Gaming Server Template"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your template and what it includes..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = "/server-templates"}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTemplateMutation.isPending || !serverAnalysis}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {createTemplateMutation.isPending ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Template
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
