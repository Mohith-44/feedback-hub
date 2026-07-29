import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  BarChart3,
  CheckCircle2,
  LineChart,
  MessagesSquare,
  Send,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { CATEGORIES, saveFeedback } from "@/lib/feedback-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feedback Hub — Collect Customer Insights" },
      {
        name: "description",
        content:
          "Feedback Hub is a professional feedback collection platform. Submit ratings, categorised comments, and help teams improve their products.",
      },
      { property: "og:title", content: "Feedback Hub — Collect Customer Insights" },
      {
        property: "og:description",
        content: "A clean, professional way to collect and analyse customer feedback.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
  rating: z.number().min(1, "Please select a rating").max(5),
  category: z.string().min(1, "Choose a category"),
  comments: z.string().trim().min(3, "Add a short comment").max(1000),
});

const RATING_LABELS: Record<number, string> = {
  1: "Very dissatisfied",
  2: "Dissatisfied",
  3: "Neutral",
  4: "Satisfied",
  5: "Very satisfied",
};

function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, rating, category, comments });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    saveFeedback(parsed.data);
    setDone(true);
    setName(""); setEmail(""); setRating(0); setCategory(""); setComments("");
  }

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
            to="/admin"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Admin Dashboard
          </Link>
        </nav>
      </header>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Customer experience
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Collect feedback that drives better decisions.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              A straightforward way to gather ratings and comments from your customers, then review
              them in a single, structured dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#feedback"
                className="btn-royal rounded-lg px-6 py-3 text-sm font-semibold"
              >
                Share your feedback
              </a>
              <Link
                to="/admin"
                className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                View dashboard
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <Highlight
              icon={<Timer className="h-5 w-5" />}
              title="Under a minute"
              body="A short, focused form so more customers actually finish it."
            />
            <Highlight
              icon={<BarChart3 className="h-5 w-5" />}
              title="Structured insights"
              body="Every response is rated and categorised for quick analysis."
            />
            <Highlight
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Private by default"
              body="Responses stay in your workspace and are never shared."
            />
          </div>
        </div>
      </section>

      <section id="feedback" className="mx-auto max-w-3xl px-6 py-16">
        <div className="card-royal p-8 sm:p-10">
          {done ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 rounded-full bg-accent/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Thank you for your feedback</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Your response has been recorded. Our team reviews every submission.
              </p>
              <button
                onClick={() => setDone(false)}
                className="btn-royal mt-8 rounded-lg px-6 py-2.5 text-sm font-semibold"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold sm:text-3xl">Share your feedback</h2>
                <p className="mt-2 text-muted-foreground">
                  All fields are required. It takes about a minute.
                </p>
              </div>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      className="input-pro"
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label="Work email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={200}
                      className="input-pro"
                      placeholder="jane@company.com"
                    />
                  </Field>
                </div>

                <Field label="Overall rating">
                  <div className="flex flex-col gap-2">
                    <StarRating value={rating} onChange={setRating} size={30} />
                    <p className="text-xs text-muted-foreground">
                      {rating ? RATING_LABELS[rating] : "Select a rating from 1 to 5."}
                    </p>
                  </div>
                </Field>

                <Field label="Category">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-pro"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Comments">
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    maxLength={1000}
                    rows={5}
                    className="input-pro resize-none"
                    placeholder="Tell us what worked well and what we could improve..."
                  />
                </Field>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-royal flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold"
                >
                  <Send className="h-4 w-4" /> Submit feedback
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-accent" />
            <span>Feedback Hub — customer insight platform</span>
          </div>
          <span>© {new Date().getFullYear()} Feedback Hub</span>
        </div>
      </footer>

      <style>{`
        .input-pro {
          width: 100%;
          background: var(--color-input);
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          padding: 0.7rem 0.9rem;
          color: var(--color-foreground);
          font-size: 0.95rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-pro:focus {
          outline: none;
          border-color: var(--color-ring);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-ring) 20%, transparent);
        }
      `}</style>
    </div>
  );
}

function Highlight({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
