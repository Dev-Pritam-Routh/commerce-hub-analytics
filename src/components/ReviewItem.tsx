import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useReview } from '@/contexts/ReviewContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewItemProps {
  review: any;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
  const { deleteReview } = useReview();
  const { user, isAuthenticated } = useAuth();

  const handleDelete = async () => {
    if (review._id) {
      try {
        await deleteReview(review._id);
        console.log('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    } else {
      console.warn('Review ID is missing or invalid.');
    }
  };

  return (
    <div key={review._id} className="mb-4 p-4 rounded-md shadow-sm bg-white dark:bg-slate-800">
      <div className="flex items-start space-x-4">
        <Avatar>
          {review.user.avatar ? (
            <AvatarImage src={review.user.avatar} alt={review.user.name} />
          ) : (
            <AvatarFallback>{review.user.name.charAt(0).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-slate-900 dark:text-slate-100">{review.user.name}</h5>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {[...Array(review.rating)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 fill-yellow-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.625 5.847l-5.051.734a1.535 1.535 0 0 0-1.238 1.044.194.194 0 0 0-.09 0l1.483 4.892-3.568 3.451a1.534 1.534 0 0 0-.546 1.457.133.133 0 0 0 .067.111l4.992 4.867-1.294 5.625a1.533 1.533 0 0 0 .44 1.379.145.145 0 0 0 .117.064l5.041-2.651 2.259 4.577a1.534 1.534 0 0 0 2.752 0l2.259-4.577 5.041 2.651a1.533 1.533 0 0 0 .44-1.379.145.145 0 0 0 .117-.064l-1.294-5.625 4.992-4.867a1.534 1.534 0 0 0-.546-1.457.133.133 0 0 0 .067-.111l1.483-4.892a.194.194 0 0 0-.09 0Z" />
              </svg>
            ))}
            {[...Array(5 - review.rating)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 fill-slate-300 dark:fill-slate-600"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.625 5.847l-5.051.734a1.535 1.535 0 0 0-1.238 1.044.194.194 0 0 0-.09 0l1.483 4.892-3.568 3.451a1.534 1.534 0 0 0-.546 1.457.133.133 0 0 0 .067.111l4.992 4.867-1.294 5.625a1.533 1.533 0 0 0 .44 1.379.145.145 0 0 0 .117.064l5.041-2.651 2.259 4.577a1.534 1.534 0 0 0 2.752 0l2.259-4.577 5.041 2.651a1.533 1.533 0 0 0 .44-1.379.145.145 0 0 0 .117-.064l-1.294-5.625 4.992-4.867a1.534 1.534 0 0 0-.546-1.457.133.133 0 0 0 .067-.111l1.483-4.892a.194.194 0 0 0-.09 0Z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
        </div>
      </div>
      {isAuthenticated && user?._id === review.userId && (
        <div className="text-right mt-2">
          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
