import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, MapPin, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Service, ProviderProfile, User } from "@shared/schema";

type ServiceWithProvider = Service & {
  provider: ProviderProfile & { user: User };
};

const CATEGORIES = ["All", "Plumbing", "Electrical", "Painting", "Carpentry", "HVAC", "Cleaning"];

export default function Services() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: services, isLoading } = useQuery<ServiceWithProvider[]>({
    queryKey: ["/api/services"],
  });

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookService = (serviceId: string) => {
    setLocation(`/booking/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary">HandyConnect</h1>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/bookings')}
              data-testid="button-my-bookings"
            >
              My Bookings
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="button-logout"
            >
              <a href="/api/logout">
                <LogOut className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Find Services</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for services..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-48" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover-elevate"
                onClick={() => setSelectedCategory(category)}
                data-testid={`badge-category-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredServices && filteredServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden hover-elevate" data-testid={`card-service-${service.id}`}>
                {service.imageUrl && (
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={service.imageUrl} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {service.category}
                      </Badge>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Provider Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={service.provider.user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {service.provider.user.firstName?.[0]}{service.provider.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {service.provider.user.firstName} {service.provider.user.lastName}
                      </p>
                      {service.provider.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{service.provider.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${service.pricePerHour}
                        <span className="text-sm text-muted-foreground font-normal">/hr</span>
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleBookService(service.id)}
                      data-testid={`button-book-${service.id}`}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No services found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
