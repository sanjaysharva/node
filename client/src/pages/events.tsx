
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react";

export default function Events() {
  const [filter, setFilter] = useState("all");

  // Mock events data - replace with actual API call
  const mockEvents = [
    {
      id: "1",
      title: "Gaming Tournament 2024",
      description: "Join the biggest Discord gaming tournament of the year! Compete with players from around the world.",
      date: "2024-02-15",
      time: "18:00",
      location: "Virtual - Discord",
      participants: 1250,
      maxParticipants: 2000,
      category: "gaming",
      status: "upcoming",
      image: "/api/placeholder/400/200",
      organizer: "GameMasters Guild"
    },
    {
      id: "2", 
      title: "Developer Meetup",
      description: "Monthly meetup for Discord bot developers. Share knowledge, collaborate on projects, and network.",
      date: "2024-02-20",
      time: "15:00",
      location: "Dev Community Server",
      participants: 89,
      maxParticipants: 150,
      category: "tech",
      status: "upcoming",
      image: "/api/placeholder/400/200",
      organizer: "DevCommunity"
    },
    {
      id: "3",
      title: "Art Showcase Event",
      description: "Showcase your digital art and get feedback from the community. Prizes for best artwork!",
      date: "2024-02-25",
      time: "20:00", 
      location: "Artists Hub",
      participants: 340,
      maxParticipants: 500,
      category: "art",
      status: "upcoming",
      image: "/api/placeholder/400/200",
      organizer: "Digital Artists Collective"
    }
  ];

  const filteredEvents = filter === "all" ? mockEvents : mockEvents.filter(event => event.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Discord Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and join amazing events happening across Discord communities
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
            { key: "all", label: "All Events" },
            { key: "gaming", label: "Gaming" },
            { key: "tech", label: "Technology" },
            { key: "art", label: "Art & Design" },
            { key: "music", label: "Music" },
            { key: "education", label: "Education" }
          ].map((category) => (
            <Button
              key={category.key}
              variant={filter === category.key ? "default" : "outline"}
              onClick={() => setFilter(category.key)}
              className="transition-all duration-300 hover:scale-105"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-primary/50 neon-border glass-card"
            >
              {/* Event Banner */}
              <div className="h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                    {event.category}
                  </Badge>
                </div>
                
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
                  <p className="text-sm opacity-90">by {event.organizer}</p>
                </div>
              </div>

              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{event.participants}/{event.maxParticipants} participants</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Participants</span>
                    <span>{Math.round((event.participants / event.maxParticipants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Join Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Join Event
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filter or check back later for new events
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
