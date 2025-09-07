import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, ArrowRight } from "lucide-react";
import type { Server } from "@shared/schema";

interface ServerCardProps {
  server: Server;
  onJoin: (serverId: string) => void;
}

export default function ServerCard({ server, onJoin }: ServerCardProps) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-primary/50 relative neon-border hover:animate-card-hover glass-card">
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

          <div className="absolute top-3 right-3 flex gap-2">
            {server.verified && (
              <Badge variant="secondary" className="bg-green-500/30 text-green-300 border-green-400/50 backdrop-blur-sm animate-neon-pulse">
                <Zap className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {server.featured && (
              <Badge variant="secondary" className="bg-yellow-500/30 text-yellow-300 border-yellow-400/50 backdrop-blur-sm">
                ⭐ Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start space-x-4 mb-4">
            {/* Server Icon with neon effect */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 border-2 border-background relative -mt-10 z-20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <i className="fas fa-server text-white text-xl drop-shadow-lg"></i>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300 bg-gradient-to-r from-foreground to-foreground group-hover:from-purple-400 group-hover:to-pink-400 bg-clip-text group-hover:text-transparent">
                {server.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                {server.description}
              </p>
            </div>
          </div>

          {/* Tags with improved styling */}
          {server.tags && server.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {server.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200 cursor-default"
                >
                  {tag}
                </Badge>
              ))}
              {server.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-muted/50 hover:bg-muted transition-colors duration-200">
                  +{server.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

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