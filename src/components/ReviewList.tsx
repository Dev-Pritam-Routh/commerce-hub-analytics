
import React, { useState } from 'react';
import { useReview } from '../contexts/ReviewContext';
import { Button } from './ui/button';
import { SelectWithOptions } from './ui/select-with-options';
import ReviewItem from './ReviewItem';
import { Skeleton } from './ui/skeleton';

interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const { reviews, isLoading } = useReview(productId);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleFilterChange = (value: string) => {
    setFilterBy(value);
  };

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4">
          <SelectWithOptions
            value={sortBy}
            onValueChange={handleSortChange}
            options={sortOptions}
            placeholder="Sort by"
            className="w-[180px]"
          />
          <SelectWithOptions
            value={filterBy}
            onValueChange={handleFilterChange}
            options={filterOptions}
            placeholder="Filter by"
            className="w-[180px]"
          />
        </div>
        <Button variant="outline">Write a Review</Button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}; 
