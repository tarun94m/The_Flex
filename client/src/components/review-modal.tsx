import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ReviewModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ review, isOpen, onClose }: ReviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => api.approveReview(reviewId, "manager"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Review Approved",
        description: "The review has been approved for public display.",
      });
      onClose();
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
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject review. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!review) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="review-modal">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.guestName}`} />
              <AvatarFallback>{review.guestName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold text-gray-900" data-testid="guest-name">
                {review.guestName}
              </h4>
              <p className="text-sm text-gray-500" data-testid="listing-name">
                {review.listingName}
              </p>
              <p className="text-sm text-gray-500" data-testid="review-date">
                {formatDate(review.submittedAt)}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Overall Rating</h5>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {renderStars(review.rating || 0)}
              </div>
              <span className="text-sm font-medium text-gray-700" data-testid="overall-rating">
                {review.rating?.toFixed(1) || "N/A"}
              </span>
            </div>
          </div>

          {review.reviewCategory && review.reviewCategory.length > 0 && (
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Category Ratings</h5>
              <div className="space-y-2">
                {review.reviewCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {category.category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(Math.round(category.rating / 2))}
                      </div>
                      <span className="text-sm text-gray-700" data-testid={`category-${category.category}`}>
                        {category.rating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Review Text</h5>
            <p className="text-sm text-gray-700 leading-relaxed" data-testid="review-text">
              {review.publicReview}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-900">Status</h5>
              <Badge 
                variant={review.approved ? "default" : "secondary"}
                data-testid="review-status"
              >
                {review.approved ? "Approved" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex space-x-2 w-full sm:w-auto sm:space-x-0 sm:space-x-reverse">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              Close
            </Button>
            {!review.approved && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => rejectMutation.mutate(review.id)}
                  disabled={rejectMutation.isPending}
                  data-testid="button-reject-review"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(review.id)}
                  disabled={approveMutation.isPending}
                  data-testid="button-approve-review"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve for Public Display
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
