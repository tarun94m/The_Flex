import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">Flex Living</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <span 
                  className={`px-1 pb-4 text-sm font-medium cursor-pointer ${
                    location === "/" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  data-testid="nav-dashboard"
                >
                  Reviews Dashboard
                </span>
              </Link>
              <Link href="/properties">
                <span 
                  className={`px-1 pb-4 text-sm cursor-pointer ${
                    location.startsWith("/properties") 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  data-testid="nav-properties"
                >
                  Properties
                </span>
              </Link>
              <span className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm cursor-pointer">
                Analytics
              </span>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <Bell className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">Sarah Chen</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
