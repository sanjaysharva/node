import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Circle } from "lucide-react";
import type { Server } from "@shared/schema";

interface ServerCardProps {
  server: Server & {
    category?: { name: string };
  };
  onJoin: (serverId: string) => void;
}

export default function ServerCard({ server, onJoin }: ServerCardProps) {
  const handleJoin = () => {
    onJoin(server.id);
  };

  return (
    <Card className="server-card bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
            {server.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                alt={`${server.name} icon`}
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="fas fa-server text-muted-foreground text-2xl"></i>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate" data-testid={`text-server-name-${server.id}`}>
              {server.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-2 line-clamp-2" data-testid={`text-server-description-${server.id}`}>
              {server.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center" data-testid={`text-member-count-${server.id}`}>
                <Users className="w-4 h-4 mr-1" />
                {server.memberCount?.toLocaleString() || 0} members
              </span>
              <span className="flex items-center text-green-400" data-testid={`text-online-count-${server.id}`}>
                <Circle className="w-2 h-2 mr-1 fill-current" />
                {server.onlineCount?.toLocaleString() || 0} online
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {server.category && (
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary hover:bg-primary/30"
              data-testid={`badge-category-${server.id}`}
            >
              {server.category.name}
            </Badge>
          )}
          {server.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-secondary/20 text-secondary border-secondary/30"
              data-testid={`badge-tag-${server.id}-${tag}`}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          onClick={handleJoin}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          data-testid={`button-join-server-${server.id}`}
        >
          Join Server
        </Button>
      </CardContent>
    </Card>
  );
}
