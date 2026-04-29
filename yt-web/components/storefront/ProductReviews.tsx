"use client";

import { useMemo, useState } from "react";
import { usePurchaseHistoryStore } from "@/store/purchaseHistoryStore";
import {
  EMPTY_PRODUCT_REVIEWS,
  useProductReviewsStore,
} from "@/store/productReviewsStore";

function StarsDisplay({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const n = Math.round(value);
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={cls} viewBox="0 0 24 24" fill={i <= n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const show = hover ?? value;
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(i)}
          className="rounded p-0.5 text-amber-500 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40"
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
        >
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill={i <= show ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const hasPurchased = usePurchaseHistoryStore((s) => s.purchasedProductIds.includes(productId));
  const hasReviewed = useProductReviewsStore((s) => s.reviewedProductIds.includes(productId));
  const reviews = useProductReviewsStore(
    (s) => s.reviewsByProduct[productId] ?? EMPTY_PRODUCT_REVIEWS,
  );
  const addReview = useProductReviewsStore((s) => s.addReview);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!comment.trim()) {
      setSubmitError("Please add a short comment.");
      return;
    }
    const res = addReview({ productId, rating, comment: comment.trim() });
    if (!res.ok) {
      if (res.reason === "not_purchased") setSubmitError("Only customers who bought this piece can review.");
      else setSubmitError("You’ve already shared a review for this item.");
      return;
    }
    setComment("");
  };

  return (
    <section className="mt-14 border-t border-brand-border pt-10" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-playfair text-2xl text-brand-text">
        Reviews
      </h2>
      <p className="mt-1 font-jost text-sm text-brand-muted">{productName}</p>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <p className="font-bebas text-4xl tracking-wide text-brand-text">
            {reviews.length ? avg.toFixed(1) : "—"}
          </p>
          <StarsDisplay value={avg} />
          <p className="mt-1 font-jost text-xs text-brand-dimmed">
            {reviews.length === 0
              ? "No reviews yet"
              : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-brand-border bg-brand-elevated/80 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StarsDisplay value={r.rating} size="sm" />
                <span className="font-jost text-xs text-brand-dimmed">
                  Verified buyer · {new Date(r.createdAt).toLocaleDateString("en-GH", { dateStyle: "medium" })}
                </span>
              </div>
              <p className="mt-3 font-jost text-sm leading-relaxed text-brand-text">{r.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 font-jost text-sm text-brand-muted">
          Be the first to review this piece after your purchase.
        </p>
      )}

      {!hasPurchased ? (
        <p className="mt-8 rounded-lg border border-dashed border-brand-border bg-brand-surface px-4 py-3 font-jost text-sm text-brand-muted">
          Ratings and comments are available to <strong className="text-brand-text">verified buyers</strong> only — place an order that includes this item, then come back here to share how it felt.
        </p>
      ) : hasReviewed ? (
        <p className="mt-8 font-jost text-sm text-brand-pink">Thank you for your review.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-[var(--border-pink)] bg-[var(--surface-card-soft)] p-6">
          <p className="font-jost text-sm font-medium text-brand-text">Your rating</p>
          <StarPicker value={rating} onChange={setRating} />
          <label className="block">
            <span className="font-jost text-xs text-brand-dimmed">Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-[var(--border-pink)] bg-[var(--surface-input)] px-3 py-2 font-jost text-sm text-brand-text outline-none focus:border-brand-pink/60 focus:ring-2 focus:ring-brand-pink/15"
              placeholder="Fit, fabric, occasion — what stood out?"
            />
          </label>
          {submitError ? <p className="font-jost text-sm text-red-600 dark:text-red-400">{submitError}</p> : null}
          <button
            type="submit"
            className="rounded-xl bg-brand-pink px-6 py-2.5 font-jost text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Submit review
          </button>
        </form>
      )}
    </section>
  );
}
