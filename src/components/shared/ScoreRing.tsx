import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorClass?: string;
  className?: string;
}

export function ScoreRing({
  score,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  colorClass = "text-primary",
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-muted" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn("transition-all duration-700", colorClass)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-bold text-2xl text-foreground leading-none">{score}</span>
        {label && <span className="text-xs text-muted-foreground mt-0.5">{label}</span>}
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
