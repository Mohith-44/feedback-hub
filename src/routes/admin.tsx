import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Crown, Search, Trash2, MessageSquareQuote, Star, TrendingUp, Users, ArrowLeft } from "lucide-react";
import { deleteFeedback, getFeedback, type Feedback } from "@/lib/feedback-store";
import { StarRating } from "@/components/StarRating";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Pride Feedback" },
      { name: "description", content: "Review, search, and manage all collected feedback in the Pride admin dashboard." },
      { property: "og:title", content: "Admin Dashboard — Pride Feedback" },
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <Crown className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl font-bold text-gold-gradient">PRIDE</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <header className="mb-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-widest text-primary">
            <Crown className="h-3.5 w-3.5" /> Kingdom Overview
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Admin <span className="text-gold-gradient">Dashboard</span></h1>
          <p className="mt-2 text-muted-foreground">Manage every roar from the pride.</p>
        </header>

        {/* Stat cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={<MessageSquareQuote />} label="Total Feedback" value={total.toString()} />
          <StatCard
            icon={<TrendingUp />}
            label="Average Rating"
            value={avg ? avg.toFixed(2) : "—"}
            extra={avg ? <StarRating value={Math.round(avg)} readOnly size={16} /> : null}
          />
          <StatCard icon={<Users />} label="Unique Contributors" value={uniqueUsers.toString()} />
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, comment..."
              className="w-full rounded-full border border-border bg-input py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-input p-1">
            <span className="px-3 text-xs uppercase tracking-wider text-muted-foreground">Rating</span>
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  ratingFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === 0 ? "All" : `${r}★`}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="mt-8 space-y-4">
          {filtered.length === 0 ? (
            <div className="card-royal grid place-items-center py-20 text-center">
              <MessageSquareQuote className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="font-display text-xl">No feedback yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length === 0 ? "Once feedback rolls in, it'll appear here." : "No results match your filters."}
              </p>
            </div>
          ) : (
            filtered.map((f) => (
              <article key={f.id} className="card-royal p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="truncate font-display text-lg font-bold text-foreground">{f.name}</h3>
                      <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                        {f.category}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{f.email}</p>
                    <div className="mt-3"><StarRating value={f.rating} readOnly size={18} /></div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{f.comments}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(f.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(f.id)}
                    className="shrink-0 rounded-full border border-destructive/40 p-2.5 text-destructive-foreground transition hover:bg-destructive/20"
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

function StatCard({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="card-royal p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="rounded-full bg-primary/10 p-2.5 text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      </div>
      <p className="mt-4 font-display text-5xl font-bold text-gold-gradient">{value}</p>
      {extra && <div className="mt-3">{extra}</div>}
    </div>
  );
}
