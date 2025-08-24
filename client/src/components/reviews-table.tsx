import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Check, X, Download, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ReviewsTableProps {
  reviews: Review[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewReview: (review: Review) => void;
}

export function ReviewsTable({ 
  reviews, 
  isLoading, 
  searchQuery, 
  onSearchChange, 
  onViewReview 
}: ReviewsTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => api.approveReview(reviewId, "manager"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Review Approved",
        description: "The review has been approved for public display.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reviewId: string) => api.rejectReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Review Rejected",
        description: "The review has been rejected and will not be displayed publicly.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    const csvContent = [
      ["Guest Name", "Property", "Channel", "Type", "Rating", "Review", "Date", "Status"],
      ...reviews.map(review => [
        review.guestName,
        review.listingName,
        review.channel,
        review.type,
        review.rating?.toString() || "N/A",
        review.publicReview?.replace(/"/g, '""') || "",
        new Date(review.submittedAt).toLocaleDateString(),
        review.approved ? "Approved" : "Pending"
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading reviews...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
          <div className="flex items-center space-x-2">
            <Input
              type="search"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64"
              data-testid="input-search-reviews"
            />
            <Button
              variant="outline"
              onClick={handleExport}
              data-testid="button-export-reviews"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No reviews found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                currentReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-gray-50" data-testid={`review-row-${review.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.guestName}`} />
                          <AvatarFallback>{review.guestName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900" data-testid={`guest-name-${review.id}`}>
                            {review.guestName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900" data-testid={`listing-name-${review.id}`}>
                        {review.listingName.split(' - ')[0]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.listingName.split(' - ')[1] || ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`channel-${review.id}`}>
                        {review.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 capitalize" data-testid={`type-${review.id}`}>
                        {review.type.replace('-', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {renderStars(review.rating || 0)}
                        </div>
                        <span className="text-sm text-gray-600 ml-1" data-testid={`rating-${review.id}`}>
                          {review.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-900" data-testid={`review-text-${review.id}`}>
                        {truncateText(review.publicReview || "")}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500" data-testid={`review-date-${review.id}`}>
                      {formatDate(review.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={review.approved ? "default" : "secondary"}
                        data-testid={`review-status-${review.id}`}
                      >
                        {review.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewReview(review)}
                          data-testid={`button-view-${review.id}`}
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        {!review.approved && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveMutation.mutate(review.id)}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${review.id}`}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejectMutation.mutate(review.id)}
                              disabled={rejectMutation.isPending}
                              data-testid={`button-reject-${review.id}`}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {reviews.length > reviewsPerPage && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, reviews.length)}</span> of{' '}
                <span className="font-medium">{reviews.length}</span> reviews
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  data-testid="button-previous-page"
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
