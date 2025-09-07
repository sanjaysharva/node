import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Server, Bot } from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryFiltersProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  onContentTypeChange: (type: "servers" | "bots") => void;
  onSortChange: (sort: string) => void;
  contentType: "servers" | "bots";
}

const sortOptions = [
  { value: "members", label: "Sort by Members" },
  { value: "newest", label: "Sort by Newest" },
  { value: "name", label: "Sort by Name" },
];

export default function CategoryFilters({
  categories,
  selectedCategories,
  onCategoryChange,
  onContentTypeChange,
  onSortChange,
  contentType,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="lg:w-1/4">
        <Card>
          <CardHeader>
            <CardTitle>Browse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                variant={contentType === "servers" ? "default" : "ghost"}
                onClick={() => onContentTypeChange("servers")}
                className="w-full justify-start"
                data-testid="button-filter-servers"
              >
                <Server className="mr-2 h-4 w-4" />
                Discord Servers
              </Button>
              <Button
                variant={contentType === "bots" ? "default" : "ghost"}
                onClick={() => onContentTypeChange("bots")}
                className="w-full justify-start"
                data-testid="button-filter-bots"
              >
                <Bot className="mr-2 h-4 w-4" />
                Discord Bots
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) =>
                          onCategoryChange(category.id, checked as boolean)
                        }
                        data-testid={`checkbox-category-${category.slug}`}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Header */}
      <div className="lg:w-3/4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">
            All {contentType === "servers" ? "Servers" : "Bots"}
          </h3>
          <Select onValueChange={onSortChange} defaultValue="members">
            <SelectTrigger className="w-48" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
