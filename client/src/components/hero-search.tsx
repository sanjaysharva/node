import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import backgroundImage from "attached_assets/generated_images/Purple_crystal_formation_background_904bf0eb.png";
import purpleCrystal from "@assets/generated_images/Purple_crystal_formation_background_904bf0eb.png";

interface HeroSearchProps {
  onSearch: (query: string) => void;
}


export default function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    onSearch(searchQuery);
  };

  return (
    <section className="relative py-20 w-full overflow-hidden">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="block text-white drop-shadow-lg">Find Your Perfect</span>
          <span className="block bg-gradient-to-r from-purple-300 via-pink-200 to-cyan-300 bg-clip-text text-transparent animate-gradient-x bg-300% drop-shadow-lg">
            Discord Community
          </span>
        </h1>

        <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
          Discover amazing Discord servers and powerful bots. Join thousands of active communities.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search servers and bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/90 border-0 rounded-xl text-gray-900 placeholder-gray-500 search-glow focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            data-testid="input-search"
          />
        </form>

      </div>
    </section>
  );
}