import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertServerSchema } from "@shared/schema";
import { Plus, Server, Users, Hash, Link2, Image, Globe, CheckCircle } from "lucide-react";

const serverFormSchema = insertServerSchema.extend({
  tags: z.string().optional(),
  bumpEnabled: z.boolean().optional(),
});

type ServerFormData = z.infer<typeof serverFormSchema>;

// Predefined tags organized by topic
const PREDEFINED_TAGS = {
  "Gaming": [
    "FPS", "MOBA", "RPG", "MMO", "Strategy", "Indie", "Competitive", "Casual",
    "Co-op", "PvP", "Minecraft", "Fortnite", "League of Legends", "Valorant", "CS2"
  ],
  "Community": [
    "Social", "Friendship", "Study", "Education", "Art", "Music", "Anime", "Movies",
    "Books", "Technology", "Programming", "Fitness", "Cooking", "Travel", "Photography"
  ],
  "Bot Features": [
    "Moderation", "Music Bot", "Economy", "Leveling", "Reaction Roles", "Tickets",
    "Polls", "Giveaways", "Welcome Bot", "Auto Mod", "Custom Commands", "Logs"
  ],
  "Server Type": [
    "Public", "Private", "SFW", "NSFW", "International", "English Only", "Multilingual",
    "Active", "Chill", "Serious", "Meme", "Support", "Trading", "Events"
  ]
};

export default function AdvertiseServer() {
  const [, setLocation] = useLocation();
  const [serverPreview, setServerPreview] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create server mutation
  const createServerMutation = useMutation({
    mutationFn: async (data: ServerFormData) => {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };
      return apiRequest("POST", "/api/servers", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Server Added Successfully!",
        description: "Your Discord server has been published and is now visible to the community.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Server",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Validate invite mutation
  const validateInviteMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await apiRequest("POST", "/api/discord/validate-invite", { inviteCode });
      return response.json();
    },
    onSuccess: (data) => {
      setServerPreview(data);
      if (data.name) {
        form.setValue("name", data.name);
      }
    },
    onError: () => {
      toast({
        title: "Invalid Invite Link",
        description: "Please check your Discord invite link and try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: "",
      description: "",
      inviteCode: "",
      tags: "",
      memberCount: 0,
      onlineCount: 0,
      verified: false,
      featured: false,
      bumpEnabled: false,
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need to be logged in to add a server.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleInviteValidation = (inviteCode: string) => {
    if (inviteCode) {
      validateInviteMutation.mutate(inviteCode);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setCustomTag("");
    }
  };

  const onSubmit = (data: ServerFormData) => {
    setIsSubmitting(true);
    const serverData = {
      ...data,
      tags: selectedTags.join(','),
      discordId: serverPreview?.serverId || null
    };
    createServerMutation.mutate(serverData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text mb-2">
              Add Your Discord Server
            </h1>
            <p className="text-muted-foreground text-lg">
              Promote your Discord server to reach thousands of potential members and grow your community.
            </p>
          </div>

          <Card className="border-purple-400/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-6 h-6 text-purple-500" />
                Server Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Discord Invite Link */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Discord Invite Link *
                    </label>
                    <FormField
                      control={form.control}
                      name="inviteCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="https://discord.gg/your-invite-code"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const value = e.target.value;
                                if (value) {
                                  const code = value.split('/').pop() || value;
                                  handleInviteValidation(code);
                                }
                              }}
                              data-testid="input-invite-code"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            We'll automatically fetch your server information
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Server Preview */}
                  {serverPreview && (
                    <Card className="border-green-400/20 bg-green-400/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-green-400">Server Verified</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center">
                            {serverPreview.icon ? (
                              <img
                                src={serverPreview.icon}
                                alt="Server Icon"
                                className="w-full h-full rounded-xl object-cover"
                              />
                            ) : (
                              <Server className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold" data-testid="text-server-preview-name">
                              {serverPreview.name || "Server Name"}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {serverPreview.memberCount || 0} members • {serverPreview.onlineCount || 0} online
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Server Name *
                      </label>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Your Server Name"
                                {...field}
                                data-testid="input-server-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Server Icon URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/icon.png"
                        className="bg-background/50 border-purple-400/30 focus:border-purple-400/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Server Description *</label>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Describe your server and what makes it special..."
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium leading-none flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Server Tags
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select tags that describe your server (maximum 10 tags)
                      </p>
                    </div>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-purple-400">Selected Tags ({selectedTags.length}/10)</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer transition-colors"
                              onClick={() => toggleTag(tag)}
                              data-testid={`badge-selected-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Tag Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Add Custom Tag</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter custom tag..."
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomTag();
                            }
                          }}
                          className="flex-1 bg-background/50 border-purple-400/30 focus:border-purple-400/50"
                          data-testid="input-custom-tag"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addCustomTag}
                          disabled={!customTag.trim() || selectedTags.length >= 10}
                          className="border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-500/10"
                          data-testid="button-add-custom-tag"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Available Tags */}
                    <div className="space-y-3">
                      {Object.entries(PREDEFINED_TAGS).map(([category, tags]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                              const isSelected = selectedTags.includes(tag);
                              const isDisabled = !isSelected && selectedTags.length >= 10;

                              return (
                                <Badge
                                  key={tag}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                                      : isDisabled
                                      ? "opacity-50 cursor-not-allowed border-muted-foreground/20 text-muted-foreground"
                                      : "border-purple-400/30 text-muted-foreground hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-purple-300"
                                  }`}
                                  onClick={() => !isDisabled && toggleTag(tag)}
                                  data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bump Settings Section */}
                  <Card className="border-blue-400/20 bg-blue-400/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-400">
                        <i className="fas fa-megaphone w-5 h-5"></i>
                        Bump Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Enable Server Bumping</label>
                            <p className="text-xs text-muted-foreground">
                              Allow your server to be promoted across the Smart Serve network
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              onChange={(e) => form.setValue('bumpEnabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="bg-card/50 rounded-lg p-4 border border-blue-400/20">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <i className="fas fa-info-circle text-blue-400"></i>
                            How Bump Works
                          </h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Your server will be promoted to other Discord servers with our bot</li>
                            <li>• Use <code className="bg-muted px-1 rounded">/bump</code> command in your server</li>
                            <li>• 2-hour cooldown between bumps</li>
                            <li>• Requires Smart Serve bot to be in your server</li>
                          </ul>
                        </div>
                        
                        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle text-yellow-400 mt-0.5"></i>
                            <div>
                              <p className="text-xs font-medium text-yellow-400">Bot Required</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Our bot must be added to your server to enable bumping.
                                {!serverPreview && " Add your invite link above to check bot status."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting || createServerMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-1"
                      data-testid="button-publish"
                    >
                      {isSubmitting || createServerMutation.isPending ? "Publishing..." : "Publish Server"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                      className="border-purple-400/30 hover:bg-purple-400/10"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}