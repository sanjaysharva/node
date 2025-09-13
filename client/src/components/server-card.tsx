import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import type { Server } from "@shared/schema";

interface ServerCardProps {
  server: Server;
  onJoin: (serverId: string) => void;
  onView?: (serverId: string) => void;
}

export default function ServerCard({ server, onJoin, onView }: ServerCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the join button
    if ((e.target as HTMLElement).closest('button')) return;
    if (onView) onView(server.id);
  };

  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-primary/50 relative neon-border hover:animate-card-hover glass-card cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

      <CardContent className="p-0 relative z-10">
        {/* Server Banner */}
        <div className="h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-16 h-16 border border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 right-4 w-8 h-8 border border-white/20 rounded-full animate-bounce"></div>
          </div>

          {/* Server Avatar */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 bg-background border-4 border-background rounded-2xl flex items-center justify-center text-foreground font-bold text-xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
              {server.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                  alt={server.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                server.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Verified Badge */}
          {server.verified && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                <i className="fas fa-check-circle mr-1"></i>
                Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 pt-10">
          {/* Server Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pt-2">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300 bg-gradient-to-r from-foreground to-foreground group-hover:from-purple-400 group-hover:to-pink-400 bg-clip-text group-hover:text-transparent">
                {server.name}
              </h3>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="flex items-center justify-between text-sm mb-5 p-3 bg-card/50 rounded-lg border border-border/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{server.memberCount?.toLocaleString() || 0}</span>
                <span className="text-xs">members</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-green-400 font-medium">{server.onlineCount?.toLocaleString() || 0}</span>
                <span className="text-xs text-muted-foreground">online</span>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 text-green-400">
                <i className="fas fa-thumbs-up"></i>
                <span>{server.upvotes || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-400">
                <i className="fas fa-comments"></i>
                <span>{server.totalComments || 0}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              {Array.isArray(server.tags) ? server.tags.join(", ") : "No tags"}
            </Badge>
          </div>

          {/* Enhanced Join Button */}
          <Button
            onClick={() => onJoin(server.id)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 group relative overflow-hidden"
            size="sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Join Server
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}