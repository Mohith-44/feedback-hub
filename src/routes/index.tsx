import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Crown, Send, ShieldCheck, Sparkles, CheckCircle2, Volume2 } from "lucide-react";
import lionHero from "@/assets/lion-hero.jpg";
import lionRoar from "@/assets/lion-roar.jpg";
import { StarRating } from "@/components/StarRating";
import { CATEGORIES, saveFeedback } from "@/lib/feedback-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pride — Regal Feedback Collection" },
      { name: "description", content: "Share your voice with Pride, a lion-themed modern feedback collection app. Rate, comment, and help us roar louder." },
      { property: "og:title", content: "Pride — Regal Feedback Collection" },
      { property: "og:description", content: "Share your voice with Pride, a lion-themed modern feedback collection app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
  rating: z.number().min(1, "Please rate us").max(5),
  category: z.string().min(1, "Choose a category"),
  comments: z.string().trim().min(3, "Add a short comment").max(1000),
});

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
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <Crown className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl font-bold text-gold-gradient">PRIDE</span>
        </Link>
        <Link
          to="/admin"
          className="rounded-full border border-primary/40 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Admin Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Voice of the Pride
            </div>
            <h1 className="font-display text-5xl leading-tight font-bold sm:text-6xl lg:text-7xl">
              Roar with <span className="text-gold-gradient">Feedback</span> that shapes kingdoms.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              A regal, modern platform to collect insights from your users. Rate, comment,
              and help us build something worthy of the mane event.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#feedback" className="btn-royal rounded-full px-8 py-3 text-base font-semibold">
                Share Feedback
              </a>
              <Link
                to="/admin"
                className="rounded-full border border-border px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                View Dashboard
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Private & secure</div>
              <div className="flex items-center gap-2"><Star /> 5-star rated</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
            <img
              src={lionHero}
              alt="Majestic 3D golden lion"
              width={1536}
              height={1024}
              className="relative rounded-3xl border border-primary/20 object-cover shadow-[var(--shadow-deep)]"
            />
          </div>
        </div>
      </section>

      {/* Feedback form */}
      <section id="feedback" className="mx-auto max-w-3xl px-6 pb-24">
        <div className="card-royal p-8 sm:p-12">
          {done ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 rounded-full bg-primary/15 p-4">
                <CheckCircle2 className="h-14 w-14 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold text-gold-gradient">Thank you!</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Your feedback has been received. The pride is grateful for your voice.
              </p>
              <button
                onClick={() => setDone(false)}
                className="btn-royal mt-8 rounded-full px-6 py-2.5 text-sm font-semibold"
              >
                Submit another
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="font-display text-3xl font-bold sm:text-4xl">Share your thoughts</h2>
                <p className="mt-2 text-muted-foreground">Every voice strengthens the pride.</p>
              </div>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      value={name} onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      className="input-royal" placeholder="Simba"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      maxLength={200}
                      className="input-royal" placeholder="you@pride.land"
                    />
                  </Field>
                </div>

                <Field label="Rating">
                  <StarRating value={rating} onChange={setRating} size={34} />
                </Field>

                <Field label="Category">
                  <select
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="input-royal"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Comments">
                  <textarea
                    value={comments} onChange={(e) => setComments(e.target.value)}
                    maxLength={1000} rows={5}
                    className="input-royal resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </Field>

                {error && (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-royal flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold">
                  <Send className="h-4 w-4" /> Submit Feedback
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <span>Pride Feedback · Built with a mane of pride</span>
        </div>
      </footer>

      <style>{`
        .input-royal {
          width: 100%;
          background: oklch(0.18 0.02 60);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--color-foreground);
          font-size: 0.95rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-royal:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px oklch(0.78 0.16 75 / 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground/90">{label}</span>
      {children}
    </label>
  );
}

function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
      <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z"/>
    </svg>
  );
}
