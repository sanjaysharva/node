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
import { insertServerSchema } from "@shared/schema";

const serverFormSchema = insertServerSchema.extend({
  tags: z.string().optional(),
});

type ServerFormData = z.infer<typeof serverFormSchema>;

export default function AddServer() {
  const [, setLocation] = useLocation();
  const [serverPreview, setServerPreview] = useState<any>(null);
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
            You need to be logged in with Discord to add a server.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const handleInviteValidation = (inviteCode: string) => {
    if (inviteCode) {
      validateInviteMutation.mutate(inviteCode);
    }
  };

  const onSubmit = (data: ServerFormData) => {
    createServerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add Your Discord Server</CardTitle>
            <p className="text-muted-foreground">
              Share your Discord server with the community
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Discord Invite Link */}
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord Invite Link *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://discord.gg/your-invite-code"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const value = e.target.value;
                            if (value) {
                              // Extract invite code from URL
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

                {/* Server Preview */}
                {serverPreview && (
                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center">
                        {serverPreview.icon ? (
                          <img
                            src={serverPreview.icon}
                            alt="Server Icon"
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <i className="fas fa-server text-muted-foreground text-2xl"></i>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold" data-testid="text-server-preview-name">
                          {serverPreview.name || "Server Name"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {serverPreview.memberCount || 0} members • {serverPreview.onlineCount || 0} online
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Server Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Name *</FormLabel>
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
                          placeholder="Describe your server and what makes it special..."
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
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
                          placeholder="Enter tags separated by commas (e.g., friendly, active, newbie-friendly)"
                          {...field}
                          data-testid="input-tags"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Add relevant tags to help users find your server
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
                    disabled={createServerMutation.isPending}
                    className="flex-1"
                    data-testid="button-publish"
                  >
                    {createServerMutation.isPending ? "Publishing..." : "Publish Server"}
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
