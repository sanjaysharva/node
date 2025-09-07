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
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 category-chip"
              onClick={() => onCategoryFilter(category.toLowerCase())}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}