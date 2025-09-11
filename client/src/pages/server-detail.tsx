
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  ExternalLink, 
  Star, 
  Clock, 
  Globe, 
  Activity,
  ArrowLeft,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Server, Review } from "@shared/schema";

export default function ServerDetail() {
  const [match, params] = useRoute("/server/:serverId");
  const serverId = params?.serverId;
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  
  // Fetch server details
  const { data: server, isLoading: loadingServer } = useQuery({
    queryKey: [`/api/servers/${serverId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/servers/${serverId}`);
      return response.json();
    }
  });

  // Fetch server reviews
  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: [`/api/servers/${serverId}/reviews`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/servers/${serverId}/reviews`);
      return response.json();
    }
  });

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; review: string }) => {
      return apiRequest("POST", `/api/servers/${serverId}/reviews`, reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}`] });
      setRating(0);
      setReviewText("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    },
  });

  const handleJoinServer = () => {
    if (!server?.inviteCode) return;
    window.open(`https://discord.gg/${server.inviteCode}`, '_blank');
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a review.",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({ rating, review: reviewText });
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < currentRating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-400"
        } ${interactive ? "cursor-pointer hover:text-yellow-300" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  if (loadingServer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Server Not Found</h1>
          <p className="text-muted-foreground mb-6">The server you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Server Banner */}
      <div className="relative h-64 overflow-hidden">
        <div 
          className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600"
          style={{
            backgroundImage: server.banner ? `url(${server.banner})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Server Icon */}
        <div className="absolute -bottom-12 left-8">
          <div className="w-24 h-24 bg-background border-4 border-background rounded-2xl flex items-center justify-center text-foreground font-bold text-2xl shadow-2xl">
            {server.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${server.discordId}/${server.icon}.png`}
                alt={server.name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              server.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 mt-8">
        {/* Server Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{server.name}</h1>
              {server.verified && (
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-lg mb-4">{server.description}</p>
            
            {/* Rating Display */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {renderStars(Math.round(server.averageRating / 100))}
              </div>
              <span className="text-muted-foreground">
                {(server.averageRating / 100).toFixed(1)} ({server.totalReviews} reviews)
              </span>
            </div>
          </div>
          
          {/* Join Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleJoinServer}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 text-lg animate-pulse"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Join Server
            </Button>
          </div>
        </div>

        {/* Server Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold">{server.memberCount?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 mx-auto mb-2 bg-green-500 rounded-full"></div>
              <div className="text-2xl font-bold text-green-400">{server.onlineCount?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Online</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold">{Math.floor((Date.now() - new Date(server.createdAt).getTime()) / (1000 * 60 * 60 * 24))}</div>
              <div className="text-sm text-muted-foreground">Days Old</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold">{server.activityLevel}</div>
              <div className="text-sm text-muted-foreground">Activity</div>
            </CardContent>
          </Card>
        </div>

        {/* Server Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Server Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>Language: {server.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Timezone: {server.timezone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span>Activity Level: {server.activityLevel}</span>
              </div>
              <div>
                <span className="text-sm font-medium mb-2 block">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {server.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Write Review */}
          <Card>
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating:</label>
                    <div className="flex items-center gap-1">
                      {renderStars(rating, true)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Review (optional):</label>
                    <Textarea
                      placeholder="Share your experience with this server..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewMutation.isPending || rating === 0}
                    className="w-full"
                  >
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Please login to write a review.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({server.totalReviews})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="h-4 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review: Review & { user: { username: string } }) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {review.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{review.user.username}</div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    {review.review && (
                      <p className="text-muted-foreground ml-10">{review.review}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
