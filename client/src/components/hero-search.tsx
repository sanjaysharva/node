import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface HeroSearchProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}

const categories = [
  "Gaming",
  "Music",
  "Tech",
  "Community",
  "Art",
];

export default function HeroSearch({ onSearch, onCategoryFilter }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="gradient-bg py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          Discover Amazing <br />
          <span className="text-accent">Discord Communities</span>
        </h1>
        <p className="text-xl mb-8 text-purple-100">
          Find the perfect Discord servers and bots for your community
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search servers, bots, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/90 border-0 rounded-xl text-gray-900 placeholder-gray-500 search-glow focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            data-testid="input-search"
          />
        </form>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              onClick={() => onCategoryFilter(category.toLowerCase())}
              className="category-chip bg-white/20 hover:bg-primary text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
