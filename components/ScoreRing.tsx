interface Props {
  label: string;
  score: number;
}

export function ScoreRing({ label, score }: Props) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const tone = score >= 90 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const verdict = score >= 90 ? "Good" : score >= 50 ? "Needs work" : "Poor";

  return (
    <div
      role="group"
      aria-label={`${label}: ${score} out of 100, ${verdict}`}
      className="flex flex-col items-center gap-1 text-center"
    >
      <svg viewBox="0 0 88 88" className={`h-24 w-24 ${tone}`} aria-hidden="true">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          transform="rotate(-90 44 44)"
          className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
        />
        <text x="44" y="51" textAnchor="middle" className="fill-current text-2xl font-semibold">
          {score}
        </text>
      </svg>
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <span className={`text-xs font-medium ${tone}`}>{verdict}</span>
    </div>
  );
}
