import React, { useState } from 'react';
import { useReview } from '../contexts/ReviewContext';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { MoreVertical, ThumbsUp, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Rating } from './ui/rating';
import { toast } from 'sonner';

interface ReviewItemProps {
  review: {
    _id: string;
    user: {
      name: string;
      avatar?: string;
    };
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    verifiedPurchase: boolean;
    helpfulVotes: number;
    createdAt: string;
  };
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const { markReviewHelpful, reportReview } = useReview();
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const handleHelpful = async () => {
    try {
      await markReviewHelpful(review._id);
      setHasMarkedHelpful(true);
      toast.success('Review marked as helpful');
    } catch (error) {
      toast.error('Failed to mark review as helpful');
    }
  };

  const handleReport = async (reason: string) => {
    try {
      await reportReview(review._id, reason);
      toast.success('Review reported successfully');
    } catch (error) {
      toast.error('Failed to report review');
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.user.avatar} />
            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{review.user.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleReport('Inappropriate content')}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Rating value={review.rating} readOnly size="sm" />
        {review.verifiedPurchase && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Verified Purchase
          </span>
        )}
      </div>

      <h3 className="font-medium">{review.title}</h3>
      <p className="text-gray-600">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="rounded-lg object-cover h-24 w-full"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpful}
          disabled={hasMarkedHelpful}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Helpful ({review.helpfulVotes})
        </Button>
      </div>
    </div>
  );
}; 