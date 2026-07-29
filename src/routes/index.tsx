import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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

type Mood = {
  label: string;
  message: string;
  tagline: string;
  mouth: "closed" | "open";
  filter: string;
  glow: string;
  ring: string;
  shake?: boolean;
  bounce?: boolean;
  sparkle?: boolean;
  tear?: boolean;
  crown?: boolean;
  freq: [number, number]; // start, end Hz
  type: OscillatorType;
  duration: number;
  gain: number;
};

const MOODS: Record<number, Mood> = {
  0: {
    label: "Awaiting",
    message: "Pick your stars…",
    tagline: "The lion watches, curious.",
    mouth: "closed",
    filter: "saturate(0.85) brightness(0.95)",
    glow: "bg-primary/20",
    ring: "ring-primary/30",
    freq: [220, 200],
    type: "sine",
    duration: 0.2,
    gain: 0.08,
  },
  1: {
    label: "Wounded",
    message: "Ouch… a whimper escapes the pride.",
    tagline: "The lion lowers its head.",
    mouth: "open",
    filter: "saturate(0.4) brightness(0.7) hue-rotate(-20deg)",
    glow: "bg-destructive/40",
    ring: "ring-destructive/50",
    shake: true,
    tear: true,
    freq: [180, 70],
    type: "triangle",
    duration: 0.9,
    gain: 0.22,
  },
  2: {
    label: "Grumpy",
    message: "Hmph. The pride is unimpressed.",
    tagline: "A low, disappointed grumble.",
    mouth: "closed",
    filter: "saturate(0.7) brightness(0.85)",
    glow: "bg-orange-500/30",
    ring: "ring-orange-500/40",
    freq: [140, 90],
    type: "sawtooth",
    duration: 0.5,
    gain: 0.18,
  },
  3: {
    label: "Curious",
    message: "Interesting… go on.",
    tagline: "The lion tilts its head, listening.",
    mouth: "closed",
    filter: "saturate(1) brightness(1)",
    glow: "bg-primary/30",
    ring: "ring-primary/40",
    freq: [260, 240],
    type: "sine",
    duration: 0.35,
    gain: 0.15,
  },
  4: {
    label: "Pleased",
    message: "The pride approves — a warm rumble.",
    tagline: "Mane fluffed, eyes bright.",
    mouth: "open",
    filter: "saturate(1.15) brightness(1.08)",
    glow: "bg-accent/45",
    ring: "ring-accent/60",
    bounce: true,
    freq: [180, 260],
    type: "sine",
    duration: 0.6,
    gain: 0.22,
  },
  5: {
    label: "Majestic",
    message: "A MIGHTY ROAR shakes the kingdom! 👑",
    tagline: "The whole savanna listens.",
    mouth: "open",
    filter: "saturate(1.3) brightness(1.15) contrast(1.05)",
    glow: "bg-primary/60",
    ring: "ring-primary/80",
    bounce: true,
    sparkle: true,
    crown: true,
    freq: [110, 55],
    type: "sawtooth",
    duration: 1.1,
    gain: 0.32,
  },
};

function playMood(m: Mood) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = m.type;
    o.frequency.setValueAtTime(m.freq[0], ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, m.freq[1]), ctx.currentTime + m.duration);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(m.gain, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + m.duration);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + m.duration + 0.05);
  } catch {}
}

function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pulse, setPulse] = useState(false);
  const lastRating = useRef(0);

  const mood = useMemo(() => MOODS[rating] ?? MOODS[0], [rating]);

  // React whenever the rating changes
  useEffect(() => {
    if (rating !== lastRating.current) {
      lastRating.current = rating;
      if (rating > 0) {
        playMood(mood);
        setPulse(true);
        const t = window.setTimeout(() => setPulse(false), 700);
        return () => window.clearTimeout(t);
      }
    }
  }, [rating, mood]);

  function replay() {
    playMood(mood);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 700);
  }

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

  const mouthOpen = mood.mouth === "open";

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
              A regal, modern platform to collect insights from your users. The lion below reacts
              to every star you give — try it.
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
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Reacts to your rating</div>
            </div>
          </div>

          {/* Interactive lion */}
          <div className="relative">
            <div
              className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-500 ${mood.glow} ${
                pulse ? "scale-125 opacity-100" : "scale-100 opacity-80"
              }`}
            />
            <div
              className={`group relative block w-full overflow-hidden rounded-3xl border border-primary/20 shadow-[var(--shadow-deep)] ring-4 transition-all duration-500 ${mood.ring} ${
                mood.shake ? "lion-shake" : ""
              } ${mood.bounce ? "lion-bounce" : ""}`}
            >
              <img
                src={lionHero}
                alt="Majestic 3D golden lion at rest"
                width={1536}
                height={1024}
                style={{ filter: mood.filter }}
                className={`block h-full w-full object-cover transition-all duration-500 ${
                  mouthOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                src={lionRoar}
                alt="Majestic 3D golden lion roaring"
                width={1536}
                height={1024}
                style={{ filter: mood.filter }}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                  mouthOpen ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Crown for 5 stars */}
              {mood.crown && (
                <Crown className="pointer-events-none absolute left-1/2 top-4 h-12 w-12 -translate-x-1/2 text-accent lion-crown-in" />
              )}

              {/* Tear for 1 star */}
              {mood.tear && (
                <span className="pointer-events-none absolute left-[38%] top-[42%] block h-3 w-2 rounded-full bg-sky-300/90 shadow-[0_0_8px_rgba(125,211,252,0.9)] lion-tear" />
              )}

              {/* Sparkles for 5 stars */}
              {mood.sparkle && (
                <>
                  <Sparkles className="pointer-events-none absolute left-[10%] top-[20%] h-6 w-6 text-primary lion-sparkle" style={{ animationDelay: "0s" }} />
                  <Sparkles className="pointer-events-none absolute right-[12%] top-[30%] h-5 w-5 text-primary lion-sparkle" style={{ animationDelay: "0.2s" }} />
                  <Sparkles className="pointer-events-none absolute right-[20%] bottom-[25%] h-7 w-7 text-primary lion-sparkle" style={{ animationDelay: "0.4s" }} />
                </>
              )}

              {/* Message caption */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      {mood.label} · {rating || "—"}★
                    </div>
                    <div className="mt-1 truncate font-display text-lg font-bold text-foreground">
                      {mood.message}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{mood.tagline}</div>
                  </div>
                </div>
              </div>

              {/* Replay button */}
              <button
                type="button"
                onClick={replay}
                aria-label="Replay lion reaction"
                className="pointer-events-auto absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md ring-1 ring-primary/40 transition hover:bg-background/90"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Replay
              </button>
            </div>
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
                  <div className="flex flex-col gap-2">
                    <StarRating value={rating} onChange={setRating} size={34} />
                    <p className="text-xs text-muted-foreground">
                      {rating ? <>The lion is <span className="text-primary font-semibold">{mood.label.toLowerCase()}</span>. {mood.tagline}</> : "Choose stars to see the lion react."}
                    </p>
                  </div>
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
          background: var(--color-input);
          border: 1px solid var(--color-border);
          border-radius: 0.625rem;
          padding: 0.75rem 1rem;
          color: var(--color-foreground);
          font-size: 0.95rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-royal:focus {
          outline: none;
          border-color: var(--color-ring);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-ring) 22%, transparent);
        }
        @keyframes lion-shake {
          0%,100% { transform: translateX(0) rotate(0); }
          20% { transform: translateX(-6px) rotate(-0.6deg); }
          40% { transform: translateX(6px) rotate(0.6deg); }
          60% { transform: translateX(-4px) rotate(-0.4deg); }
          80% { transform: translateX(4px) rotate(0.4deg); }
        }
        .lion-shake { animation: lion-shake 0.5s ease-in-out 2; }
        @keyframes lion-bounce {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .lion-bounce { animation: lion-bounce 1.4s ease-in-out infinite; }
        @keyframes lion-tear {
          0% { transform: translateY(-4px) scale(0.6); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(60px) scale(1); opacity: 0; }
        }
        .lion-tear { animation: lion-tear 1.6s ease-in infinite; }
        @keyframes lion-sparkle {
          0%,100% { transform: scale(0.6) rotate(0); opacity: 0.3; }
          50% { transform: scale(1.15) rotate(20deg); opacity: 1; }
        }
        .lion-sparkle { animation: lion-sparkle 1.4s ease-in-out infinite; }
        @keyframes lion-crown-in {
          0% { transform: translate(-50%, -30px) scale(0.5) rotate(-15deg); opacity: 0; }
          60% { transform: translate(-50%, 4px) scale(1.1) rotate(5deg); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1) rotate(0); opacity: 1; }
        }
        .lion-crown-in { animation: lion-crown-in 0.6s ease-out both; }
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
