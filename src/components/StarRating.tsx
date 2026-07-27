import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  size = 28,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className="transition-transform hover:scale-110 disabled:hover:scale-100"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={
              n <= value
                ? "fill-primary text-primary drop-shadow-[0_0_8px_oklch(0.82_0.17_80/0.6)]"
                : "text-muted-foreground/40"
            }
          />
        </button>
      ))}
    </div>
  );
}
