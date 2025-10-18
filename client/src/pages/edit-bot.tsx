import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { usePageTitle } from "@/hooks/use-page-title";
import { Bot, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { insertBotSchema } from "@shared/schema";

const botFormSchema = insertBotSchema.extend({
  tags: z.string().optional(),
});

type BotFormData = z.infer<typeof botFormSchema>;

const BOT_TAGS = {
  "Features": [
    "Music", "Moderation", "Economy", "Leveling", "Reaction Roles", "Tickets",
    "Polls", "Giveaways", "Welcome Bot", "Auto Mod", "Custom Commands", "Logs",
    "Fun Commands", "Utility", "Games", "Trivia", "Reminder", "Translator"
  ],
  "Categories": [
    "Multi-purpose", "Music Bot", "Moderation Bot", "Utility Bot", "Fun Bot",
    "Economy Bot", "Roleplay Bot", "Gaming Bot", "Social Bot", "Educational",
    "Art Bot", "Meme Bot", "News Bot", "Weather Bot", "Anime Bot"
  ],
  "Technology": [
    "Slash Commands", "Prefix Commands", "Web Dashboard", "AI Powered",
    "Machine Learning", "Open Source", "Premium Features", "Free", "24/7 Uptime",
    "Fast Response", "Lightweight", "Feature Rich", "Customizable", "Secure"
  ]
};

export default function EditBotPage() {
  const [, params] = useRoute("/bots/edit/:id");
  const [, navigate] = useLocation();
  const botId = params?.id;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>("");

  usePageTitle("Edit Bot");

  const { data: bot, isLoading } = useQuery({
    queryKey: [`/api/bots/${botId}`],
    enabled: !!botId,
  });

  const form = useForm<BotFormData>({
    resolver: zodResolver(botFormSchema),
    values: bot || undefined,
  });

  useEffect(() => {
    if (bot?.tags) {
      const tags = typeof bot.tags === 'string' 
        ? bot.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : Array.isArray(bot.tags) 
        ? bot.tags 
        : [];
      setSelectedTags(tags);
    }
  }, [bot]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<BotFormData>) => {
      const processedData = {
        ...data,
        tags: selectedTags.join(','),
      };
      return await apiRequest(`/api/bots/${botId}`, {
        method: "PATCH",
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}`] });
      toast({
        title: "Success",
        description: "Bot updated successfully!",
      });
      navigate("/my-cards");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/bots/${botId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Success",
        description: "Bot deleted successfully!",
      });
      navigate("/my-cards");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BotFormData) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this bot? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 15) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < 15) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setCustomTag("");
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
              <p className="text-gray-400">You need to be logged in to edit bots.</p>
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
            <div className="w-8 h-8 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="text-gray-400 hover:text-white mb-4"
            >
              <Link href="/my-cards">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Cards
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Bot</h1>
            <p className="text-gray-400">Update your bot information</p>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5 text-purple-500" />
                Bot Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Bot Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={6} className="bg-gray-800 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Short Description</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} className="bg-gray-800 border-gray-700 text-white" />
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
                        <FormLabel className="text-gray-200">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Moderation">Moderation</SelectItem>
                            <SelectItem value="Music">Music</SelectItem>
                            <SelectItem value="Fun">Fun</SelectItem>
                            <SelectItem value="Utility">Utility</SelectItem>
                            <SelectItem value="Economy">Economy</SelectItem>
                            <SelectItem value="Multipurpose">Multipurpose</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormLabel className="text-gray-200">Tags (Select up to 15)</FormLabel>
                    <div className="space-y-4">
                      {Object.entries(BOT_TAGS).map(([category, tags]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className={`cursor-pointer ${
                                  selectedTags.includes(tag)
                                    ? "bg-purple-600 text-white"
                                    : "border-gray-700 text-gray-300 hover:border-purple-500"
                                }`}
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Input
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add custom tag"
                        className="bg-gray-800 border-gray-700 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                      />
                      <Button type="button" onClick={addCustomTag} variant="outline" className="border-gray-700">
                        Add
                      </Button>
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-sm text-gray-400">Selected:</span>
                        {selectedTags.map((tag) => (
                          <Badge key={tag} className="bg-purple-600 text-white">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                              className="ml-2"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="inviteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Invite URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Prefix</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} className="bg-gray-800 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Updating..." : "Update Bot"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
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
