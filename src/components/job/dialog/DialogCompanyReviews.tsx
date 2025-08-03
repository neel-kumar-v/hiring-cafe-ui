"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rating, RatingButton } from "@/components/ui/rating";
import UniversalTooltip from "@/components/util/UniversalTooltip";
import { Send, User } from "lucide-react";
import { useState } from "react";

type Review = {
  id: string;
  username: string;
  rating: number;
  title: string;
  review: string;
  date: string;
};

const ratingLabels = {
  1: "Horrible",
  2: "Bad",
  3: "OK",
  4: "Good",
  5: "Great",
};

const ratingColors = {
  1: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  2: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  4: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  5: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const sampleReviews: Review[] = [
  {
    id: "1",
    username: "Sarah Chen",
    rating: 5,
    title: "Amazing company culture and growth opportunities",
    review:
      "I've been working here for 2 years and the culture is fantastic. Great work-life balance, supportive management, and plenty of opportunities to grow. The team is collaborative and the projects are challenging but rewarding.",
    date: "2024-01-15",
  },
  {
    id: "2",
    username: "Mike Rodriguez",
    rating: 4,
    title: "Good experience overall with room for improvement",
    review:
      "The company has solid benefits and the work is interesting. Management is generally supportive, though communication could be better at times. Good opportunities for learning new technologies.",
    date: "2024-01-10",
  },
  {
    id: "3",
    username: "Alex Thompson",
    rating: 3,
    title: "Decent place to work, some challenges",
    review: "The work environment is okay. Pay is competitive but workload can be heavy. Some processes could be streamlined. Overall not bad but not exceptional either.",
    date: "2024-01-05",
  },
  {
    id: "4",
    username: "Jessica Kim",
    rating: 2,
    title: "Disappointing experience",
    review:
      "Management is disorganized and there's a lot of turnover. The work environment is stressful and there's little support for professional development. Would not recommend.",
    date: "2023-12-20",
  },
  {
    id: "5",
    username: "David Wilson",
    rating: 1,
    title: "Terrible workplace culture",
    review: "Extremely toxic work environment. Management is incompetent and there's no work-life balance. High turnover rate and poor communication. Avoid this company.",
    date: "2023-12-15",
  },
];

export default function DialogCompanyReviews({ badge = false }: { badge?: boolean }) {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [newReview, setNewReview] = useState({
    title: "",
    review: "",
    rating: 0,
  });

  const handleSubmitReview = () => {
    if (!newReview.title.trim() || !newReview.review.trim() || newReview.rating === 0) {
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      username: "Anonymous User",
      rating: newReview.rating,
      title: newReview.title,
      review: newReview.review,
      date: new Date().toISOString().split("T")[0],
    };

    setReviews([review, ...reviews]);
    setNewReview({ title: "", review: "", rating: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Write a Review</h3>
        <div className="space-y-3">
          <Input placeholder="Review title" value={newReview.title} onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rating:</span>
            <Rating value={newReview.rating} onValueChange={(value) => setNewReview((prev) => ({ ...prev, rating: value }))} className="gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <UniversalTooltip key={star} content={ratingLabels[star as keyof typeof ratingLabels]}>
                  <RatingButton index={star - 1} />
                </UniversalTooltip>
              ))}
            </Rating>
          </div>
          <div className="relative">
            <textarea
              placeholder="Write your review..."
              value={newReview.review}
              onChange={(e) => setNewReview((prev) => ({ ...prev, review: e.target.value }))}
              className="w-full min-h-[100px] p-3 border border-input rounded-md bg-accent text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Button
              onClick={handleSubmitReview}
              disabled={!newReview.title.trim() || !newReview.review.trim() || newReview.rating === 0}
              size="sm"
              className="absolute bottom-2 right-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Company Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{review.username}</span>
                    {badge ? (
                        <Badge variant="secondary" className={`text-xs ${ratingColors[review.rating as keyof typeof ratingColors]}`}>
                            {ratingLabels[review.rating as keyof typeof ratingLabels]}
                        </Badge>
                    ) : (
                        <Rating value={review.rating} readOnly className="gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <RatingButton key={star} index={star - 1} size={14} />
                        ))}
                        </Rating>
                    )}
                    {/* <span className="text-xs text-muted-foreground">{review.date}</span> */}
                  </div>
                  <h4 className="font-medium text-sm mb-2">{review.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.review}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
