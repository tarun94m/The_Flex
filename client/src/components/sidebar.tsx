import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import type { ReviewFilters } from "@shared/schema";

interface SidebarProps {
  filters: ReviewFilters;
  onFiltersChange: (filters: ReviewFilters) => void;
  onApplyFilters: () => void;
}

export function Sidebar({ filters, onFiltersChange, onApplyFilters }: SidebarProps) {
  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    if (checked) {
      handleFilterChange('categories', [...currentCategories, category]);
    } else {
      handleFilterChange('categories', currentCategories.filter(c => c !== category));
    }
  };

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters & Controls</h2>
        
        {/* Property Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Property</Label>
          <Select value={filters.property || "all"} onValueChange={(value) => handleFilterChange('property', value === 'all' ? undefined : value)}>
            <SelectTrigger data-testid="select-property">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="shoreditch">29 Shoreditch Heights</SelectItem>
              <SelectItem value="camden">15 Camden Square</SelectItem>
              <SelectItem value="notting">8 Notting Hill Gardens</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</Label>
          <Select value={filters.rating || "all"} onValueChange={(value) => handleFilterChange('rating', value === 'all' ? undefined : value)}>
            <SelectTrigger data-testid="select-rating">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-3">Categories</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cleanliness"
                checked={filters.categories?.includes('cleanliness') || false}
                onCheckedChange={(checked) => handleCategoryChange('cleanliness', checked as boolean)}
                data-testid="checkbox-cleanliness"
              />
              <Label htmlFor="cleanliness" className="text-sm text-gray-600">Cleanliness</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="communication"
                checked={filters.categories?.includes('communication') || false}
                onCheckedChange={(checked) => handleCategoryChange('communication', checked as boolean)}
                data-testid="checkbox-communication"
              />
              <Label htmlFor="communication" className="text-sm text-gray-600">Communication</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="house_rules"
                checked={filters.categories?.includes('respect_house_rules') || false}
                onCheckedChange={(checked) => handleCategoryChange('respect_house_rules', checked as boolean)}
                data-testid="checkbox-house-rules"
              />
              <Label htmlFor="house_rules" className="text-sm text-gray-600">House Rules</Label>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Date Range</Label>
          <div className="space-y-2">
            <Input 
              type="date" 
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              data-testid="input-start-date"
            />
            <Input 
              type="date" 
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              data-testid="input-end-date"
            />
          </div>
        </div>

        {/* Channel Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Channel</Label>
          <Select value={filters.channel || "all"} onValueChange={(value) => handleFilterChange('channel', value === 'all' ? undefined : value)}>
            <SelectTrigger data-testid="select-channel">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="hostaway">Hostaway</SelectItem>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="booking.com">Booking.com</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Review Type Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Review Type</Label>
          <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}>
            <SelectTrigger data-testid="select-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="guest-to-host">Guest to Host</SelectItem>
              <SelectItem value="host-to-guest">Host to Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Review Status */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-3">Review Status</Label>
          <RadioGroup 
            value={filters.status || "all"} 
            onValueChange={(value) => handleFilterChange('status', value as 'all' | 'approved' | 'pending' | 'rejected')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" data-testid="radio-all" />
              <Label htmlFor="all" className="text-sm text-gray-600">All Reviews</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="approved" data-testid="radio-approved" />
              <Label htmlFor="approved" className="text-sm text-gray-600">Approved</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="pending" data-testid="radio-pending" />
              <Label htmlFor="pending" className="text-sm text-gray-600">Pending</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="rejected" data-testid="radio-rejected" />
              <Label htmlFor="rejected" className="text-sm text-gray-600">Rejected</Label>
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={onApplyFilters}
          className="w-full bg-primary text-white hover:bg-blue-700"
          data-testid="button-apply-filters"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
