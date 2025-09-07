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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertBotSchema } from "@shared/schema";
import type { Category } from "@shared/schema";

const botFormSchema = insertBotSchema.extend({
  tags: z.string().optional(),
});

type BotFormData = z.infer<typeof botFormSchema>;

export default function AddBot() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create bot mutation
  const createBotMutation = useMutation({
    mutationFn: async (data: BotFormData) => {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };
      return apiRequest("POST", "/api/bots", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot Added Successfully!",
        description: "Your Discord bot has been published and is now visible to the community.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Bot",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<BotFormData>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      name: "",
      description: "",
      botId: "",
      inviteUrl: "",
      categoryId: "",
      tags: "",
      prefix: "",
      serverCount: 0,
      verified: false,
      featured: false,
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-8">
            You need to be logged in with Discord to add a bot.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: BotFormData) => {
    createBotMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add Your Discord Bot</CardTitle>
            <p className="text-muted-foreground">
              Share your Discord bot with the community
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Bot Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Bot Name"
                          {...field}
                          data-testid="input-bot-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bot ID */}
                <FormField
                  control={form.control}
                  name="botId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456789012345678"
                          {...field}
                          data-testid="input-bot-id"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        You can find this in your bot's application page
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Invite URL */}
                <FormField
                  control={form.control}
                  name="inviteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Invite URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://discord.com/api/oauth2/authorize?client_id=..."
                          {...field}
                          data-testid="input-invite-url"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        The invite link for users to add your bot to their servers
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe your bot's features and capabilities..."
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bot Prefix */}
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Prefix</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="! or $ or //"
                          {...field}
                          data-testid="input-prefix"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        The prefix users need to type before commands (leave empty for slash commands only)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tags separated by commas (e.g., music, moderation, fun)"
                          {...field}
                          data-testid="input-tags"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Add relevant tags to help users find your bot
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setLocation("/")}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBotMutation.isPending}
                    className="flex-1"
                    data-testid="button-publish"
                  >
                    {createBotMutation.isPending ? "Publishing..." : "Publish Bot"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
