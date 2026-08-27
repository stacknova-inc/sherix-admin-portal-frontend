"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock3, MessageSquareText, Star, ThumbsUp } from "lucide-react";
import { AdminDataTable } from "@/components/shared/AdminDataTable";
import {
  ActionMenu,
  FilterSelect,
  InitialAvatar,
  MetricGrid,
  RatingStars,
  SearchBox,
  StatusCell,
  ToolbarCard,
} from "@/components/shared/AdminPrimitives";
import { CardShell } from "@/components/shared/CardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { getErrorMessage } from "@/lib/api";
import { asRecord, dateText, firstText, initials, metricValue, recordId, text, timeText } from "@/lib/live-data";
import { useReviews, useReviewStats } from "@/hooks/useReviews";
import type { Review } from "@/types";

type ReviewRow = {
  id: string;
  rating: number;
  title: string;
  text: string;
  service: string;
  reviewer: string;
  provider: string;
  initials: string;
  date: string;
  time: string;
  status: string;
};

function mapReview(review: Review): ReviewRow {
  const record = review as unknown as Record<string, unknown>;
  const customer = asRecord(record.customer ?? record.reviewer ?? record.user ?? record.customerData);
  const mechanic = asRecord(record.mechanic ?? record.provider ?? record.serviceProvider ?? record.providerData);
  const related = asRecord(record.relatedTo ?? record.reference ?? record.serviceRequest ?? record.booking ?? record.job ?? record.request);
  const reviewer = firstText(record, ["reviewerName", "customerName", "customerId"], text(customer, "Unknown reviewer"));
  const provider = firstText(record, ["providerName", "mechanicName", "mechanicId"], text(mechanic, "Unknown provider"));
  const service = firstText(
    record,
    ["referenceType", "relatedToType", "referenceId", "relatedToId"],
    firstText(related, ["name", "title", "service", "requestId", "id", "_id"], "Review"),
  );
  const rating = Number(record.rating ?? record.score ?? 0);

  return {
    id: recordId(review) || firstText(record, ["referenceId", "reviewId"], "-"),
    rating: Number.isFinite(rating) ? rating : 0,
    title: firstText(record, ["title", "referenceType", "relatedToType"], "Customer review"),
    text: firstText(record, ["comment", "review", "message", "description"], "No comment provided."),
    service,
    reviewer,
    provider,
    initials: initials(reviewer),
    date: dateText(review.createdAt ?? record.created_at),
    time: timeText(review.createdAt ?? record.created_at),
    status: firstText(record, ["status", "reviewStatus"], record.isVerified ? "Verified" : "Pending"),
  };
}

const reviewColumns: ColumnDef<ReviewRow>[] = [
  { accessorKey: "id", header: "Review ID", cell: ({ row }) => <span className="font-black">{row.original.id}</span> },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <RatingStars rating={row.original.rating} showValue={false} />
        <span className="text-xs font-bold">{row.original.rating.toFixed(1)}</span>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Review",
    cell: ({ row }) => (
      <div className="max-w-[280px]">
        <p className="font-black">{row.original.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.original.text}</p>
      </div>
    ),
  },
  { accessorKey: "service", header: "Related To", cell: ({ row }) => <p className="min-w-[150px] font-bold">{row.original.service}</p> },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => (
      <div className="flex min-w-[150px] items-center gap-3">
        <InitialAvatar initials={row.original.initials} />
        <div>
          <p className="font-bold">{row.original.reviewer}</p>
          <p className="text-xs text-muted-foreground">Customer</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "provider", header: "Provider", cell: ({ row }) => <p className="min-w-[150px] font-bold">{row.original.provider}</p> },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <p className="font-semibold">{row.original.date}</p>
        <p className="text-xs text-muted-foreground">{row.original.time}</p>
      </div>
    ),
  },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusCell status={row.original.status} /> },
  { id: "actions", header: "Actions", cell: () => <ActionMenu /> },
];

export default function RatingsReviewsPage() {
  const [query, setQuery] = React.useState("");
  const [rating, setRating] = React.useState("All Ratings");
  const [status, setStatus] = React.useState("All Statuses");
  const reviewsQuery = useReviews();
  const statsQuery = useReviewStats();
  const rows = React.useMemo(() => (reviewsQuery.data?.reviews ?? []).map(mapReview), [reviewsQuery.data]);
  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    const selectedRating = Number(rating.split(" ")[0]);
    return rows.filter((row) => {
      const matchesSearch = !search || [row.id, row.provider, row.reviewer, row.service, row.text, row.status].join(" ").toLowerCase().includes(search);
      const matchesRating = rating === "All Ratings" || Math.round(row.rating) === selectedRating;
      const matchesStatus = status === "All Statuses" || row.status.toLowerCase().includes(status.toLowerCase());
      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [query, rating, rows, status]);

  const stats = asRecord(statsQuery.data);
  const metrics = [
    { label: "Average Rating", value: metricValue(stats, ["averageRating", "average_rating", "average"]), change: "Live backend data", direction: "up", tone: "amber", icon: Star },
    { label: "Total Reviews", value: metricValue(stats, ["totalReviews", "total_reviews", "total"], String(rows.length)), change: "Live backend data", direction: "up", tone: "blue", icon: MessageSquareText },
    { label: "This Week", value: metricValue(stats, ["reviewsThisWeek", "reviews_this_week", "thisWeek"]), change: "Live backend data", direction: "up", tone: "purple", icon: Clock3 },
    { label: "Positive", value: metricValue(stats, ["positiveReviews", "positive_reviews", "positive"]), change: "Live backend data", direction: "up", tone: "green", icon: ThumbsUp },
    { label: "Negative", value: metricValue(stats, ["negativeReviews", "negative_reviews", "negative"]), change: "Live backend data", direction: "down", tone: "red", icon: CheckCircle2 },
    { label: "Pending", value: metricValue(stats, ["pendingReviews", "pending_reviews", "pending"]), change: "Needs review", direction: "down", tone: "slate", icon: Clock3 },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Ratings & Reviews" subtitle="Monitor and manage ratings and reviews across the platform." />
      <MetricGrid metrics={metrics} columns="xl:grid-cols-6" />

      <section className="grid gap-4">
        <CardShell>
          <ToolbarCard>
            <SearchBox placeholder="Search by review ID, provider, customer or service..." value={query} onChange={setQuery} />
            <FilterSelect placeholder="All Ratings" values={["All Ratings", "5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"]} value={rating} onChange={setRating} />
            <FilterSelect placeholder="All Statuses" values={["All Statuses", "Published", "Pending", "Flagged", "Verified"]} value={status} onChange={setStatus} />
          </ToolbarCard>

          {reviewsQuery.isLoading ? (
            <div className="p-6 text-sm font-semibold text-muted-foreground">Loading reviews...</div>
          ) : reviewsQuery.isError ? (
            <div className="p-6 text-sm font-semibold text-red-600">{getErrorMessage(reviewsQuery.error, "Unable to load reviews.")}</div>
          ) : (
            <AdminDataTable data={filteredRows} columns={reviewColumns} minWidth="1280px" rowLabel="reviews" />
          )}
        </CardShell>
      </section>
    </div>
  );
}