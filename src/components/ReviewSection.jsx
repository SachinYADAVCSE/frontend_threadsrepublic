
import { useMemo, useState } from "react";
import "./ReviewSection.css";

const StarRating = ({ rating = 0, size = "normal" }) => {
    return (
        <span
            className={`review-stars review-stars-${size}`}
            aria-label={`${rating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={star <= Math.round(rating) ? "review-star-filled" : "review-star-empty"}
                >
                    ★
                </span>
            ))}
        </span>
    );
};

const VerifiedBadge = () => (
    <span className="verified-purchase">
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            
            <path
                d="M5.8 10.2 8.5 12.8 14.2 7.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <span>Verified purchase</span>
    </span>
);

const ReviewSection = ({
    reviews = [],
    loading = false,
    summary = null,
    error = "",
    onSubmitReview,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    const publishedReviews = useMemo(
        () => reviews.filter((review) => review.isPublished !== false),
        [reviews]
    );

    const averageRating = useMemo(() => {
        if (summary) {
            return Number(summary.averageRating || 0);
        }

        if (!publishedReviews.length) return 0;

        const total = publishedReviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
        );

        return total / publishedReviews.length;
    }, [summary, publishedReviews]);

    const totalReviews = summary
        ? Number(summary.totalReviews || 0)
        : publishedReviews.length;

    const ratingCounts = useMemo(() => {
        return [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: summary?.ratingDistribution
                ? Number(summary.ratingDistribution[rating] || 0)
                : publishedReviews.filter(
                    (review) => Number(review.rating) === rating
                ).length,
        }));
    }, [summary, publishedReviews]);

    const sortedReviews = useMemo(() => {
        const result = [...publishedReviews];

        if (sortBy === "highest") {
            result.sort((a, b) => Number(b.rating) - Number(a.rating));
        } else if (sortBy === "lowest") {
            result.sort((a, b) => Number(a.rating) - Number(b.rating));
        } else {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime()
            );
        }

        return result;
    }, [publishedReviews, sortBy]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setReviewError("");

        if (!selectedRating) {
            setReviewError("Please select a star rating.");
            return;
        }

        if (!title.trim() || !comment.trim()) {
            setReviewError("Please enter a review title and comment.");
            return;
        }

        if (typeof onSubmitReview !== "function") {
            setReviewError(
                "Review submission is not connected yet. The backend API needs to be configured."
            );
            return;
        }

        try {
            setSubmitting(true);

            await onSubmitReview({
                rating: selectedRating,
                title: title.trim(),
                comment: comment.trim(),
            });

            setSelectedRating(0);
            setTitle("");
            setComment("");
            setShowForm(false);
        } catch (error) {
            setReviewError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to submit your review. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="product-reviews" id="customer-reviews">
            <div className="reviews-heading">
                <div>
                    <p className="reviews-eyebrow">THE COMMUNITY</p>
                    <h2>Customer reviews</h2>
                    <p className="reviews-subtitle">
                        Real feedback helps everyone find their fit.
                    </p>
                </div>

                <button
                    type="button"
                    className="write-review-button"
                    onClick={() => setShowForm((current) => !current)}
                >
                    {showForm ? "Cancel" : "Write a review"}
                </button>
            </div>

            {showForm && (
                <form className="review-form" onSubmit={handleSubmit}>
                    <h3>Share your experience</h3>

                    <label className="review-form-label">
                        Your rating
                    </label>

                    <div className="review-rating-picker">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={
                                    star <= (hoverRating || selectedRating)
                                        ? "rating-picker-star is-selected"
                                        : "rating-picker-star"
                                }
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setSelectedRating(star)}
                                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                aria-pressed={selectedRating === star}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <label className="review-form-label" htmlFor="review-title">
                        Review title
                    </label>
                    <input
                        id="review-title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Summarize your experience"
                        maxLength={100}
                        required
                    />

                    <label className="review-form-label" htmlFor="review-comment">
                        Your review
                    </label>
                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="What did you like or dislike about this product?"
                        rows={5}
                        maxLength={2000}
                        required
                    />

                    {reviewError && (
                        <p className="review-form-error" role="alert">
                            {reviewError}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="review-submit-button"
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit review"}
                    </button>

                    <p className="review-form-note">
                        Verified purchase status is determined by the store, not by the reviewer.
                    </p>
                </form>
            )}

            {loading ? (
                <div className="reviews-message">Loading customer reviews...</div>
            ) : (
                <>
                    <div className="reviews-summary">
                        <div className="reviews-average">
                            <strong>{totalReviews ? averageRating.toFixed(1) : "—"}</strong>
                            <StarRating rating={averageRating} />
                            <span>
                                {publishedReviews.length}{" "}
                                {publishedReviews.length === 1 ? "review" : "reviews"}
                            </span>
                        </div>

                        <div className="reviews-breakdown">
                            {ratingCounts.map(({ rating, count }) => {
                                const percentage = publishedReviews.length
                                    ? (count / publishedReviews.length) * 100
                                    : 0;

                                return (
                                    <div className="rating-breakdown-row" key={rating}>
                                        <span>{rating} star</span>
                                        <div
                                            className="rating-breakdown-track"
                                            role="progressbar"
                                            aria-label={`${rating} star reviews`}
                                            aria-valuenow={count}
                                            aria-valuemin={0}
                                            aria-valuemax={publishedReviews.length || 1}
                                        >
                                            <div
                                                className="rating-breakdown-fill"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="rating-breakdown-count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="reviews-list-heading">
                        <h3>What customers say</h3>

                        <label className="reviews-sort">
                            <span>Sort by</span>
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                aria-label="Sort reviews"
                            >
                                <option value="newest">Most recent</option>
                                <option value="highest">Highest rating</option>
                                <option value="lowest">Lowest rating</option>
                            </select>
                        </label>
                    </div>

                    {sortedReviews.length === 0 ? (
                        <div className="reviews-empty">
                            <div className="reviews-empty-stars">★★★★★</div>
                            <h3>Be the first to leave a review</h3>
                            <p>
                                Share your experience with this product and help other customers.
                            </p>
                            <button
                                type="button"
                                className="write-review-button"
                                onClick={() => setShowForm(true)}
                            >
                                Write the first review
                            </button>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {sortedReviews.map((review) => (
                                <article className="review-card" key={review._id || review.id}>
                                    <div className="review-card-top">
                                        <div className="review-avatar" aria-hidden="true">
                                            {(review.customerName || "C")
                                                .trim()
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="review-author-info">
                                            <div className="review-author-line">
                                                <span className="review-author">
                                                    {review.customerName || "Customer"}
                                                </span>

                                                {review.isVerifiedPurchase === true && (
                                                    <VerifiedBadge />
                                                )}
                                            </div>

                                            <span className="review-date">
                                                {review.createdAt
                                                    ? new Date(review.createdAt).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "Date unavailable"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="review-card-rating">
                                        <StarRating rating={Number(review.rating || 0)} />
                                    </div>

                                    <h4 className="review-card-title">{review.title}</h4>

                                    <p className="review-card-comment">{review.comment}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default ReviewSection;
