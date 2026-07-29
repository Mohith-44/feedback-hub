import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessagesSquare,
  MessageSquareQuote,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { deleteFeedback, getFeedback, type Feedback } from "@/lib/feedback-store";
import { StarRating } from "@/components/StarRating";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Feedback Hub" },
      {
        name: "description",
        content: "Review, search, filter, and manage all collected customer feedback.",
      },
      { property: "og:title", content: "Admin Dashboard — Feedback Hub" },
      { property: "og:description", content: "Review, search, and manage all collected feedback." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);

  useEffect(() => { setItems(getFeedback()); }, []);

  function refresh() { setItems(getFeedback()); }

  function onDelete(id: string) {
    if (!confirm("Delete this feedback?")) return;
    deleteFeedback(id);
    refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((f) => {
      const matchQ = !q || [f.name, f.email, f.comments, f.category].some((v) => v.toLowerCase().includes(q));
      const matchR = !ratingFilter || f.rating === ratingFilter;
      return matchQ && matchR;
    });
  }, [items, query, ratingFilter]);

  const total = items.length;
  const avg = total ? items.reduce((s, f) => s + f.rating, 0) / total : 0;
  const uniqueUsers = new Set(items.map((f) => f.email.toLowerCase())).size;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MessagesSquare className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Feedback Hub</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-muted-foreground">Review and manage all submitted feedback.</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={<MessageSquareQuote />} label="Total feedback" value={total.toString()} />
          <StatCard
            icon={<TrendingUp />}
            label="Average rating"
            value={avg ? avg.toFixed(2) : "—"}
            extra={avg ? <StarRating value={Math.round(avg)} readOnly size={16} /> : null}
          />
          <StatCard icon={<Users />} label="Unique contributors" value={uniqueUsers.toString()} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, comment..."
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-ring"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <span className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rating
            </span>
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  ratingFilter === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === 0 ? "All" : `${r}★`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="card-royal grid place-items-center py-20 text-center">
              <MessageSquareQuote className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-semibold">No feedback yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length === 0
                  ? "Once responses come in, they'll appear here."
                  : "No results match your filters."}
              </p>
            </div>
          ) : (
            filtered.map((f) => (
              <article key={f.id} className="card-royal p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="truncate text-base font-semibold text-foreground">{f.name}</h3>
                      <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
                        {f.category}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{f.email}</p>
                    <div className="mt-3"><StarRating value={f.rating} readOnly size={16} /></div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {f.comments}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(f.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(f.id)}
                    className="shrink-0 rounded-lg border border-border p-2.5 text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                    aria-label="Delete feedback"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  extra,
}: { icon: React.ReactNode; label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="card-royal p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="rounded-lg bg-accent/10 p-2 text-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      </div>
      <p className="mt-4 text-4xl font-bold tracking-tight">{value}</p>
      {extra && <div className="mt-3">{extra}</div>}
    </div>
  );
}
