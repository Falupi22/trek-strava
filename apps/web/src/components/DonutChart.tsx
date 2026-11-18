import { useEffect, useState } from "react";
import { getHealthColor } from "@bikehealth/shared";
import { useI18n } from "../i18n";

interface Props {
  percent: number;
  size?: number;
}

// Compact health ring: thin track, animated arc, percentage in the centre.
export default function DonutChart({ percent, size = 76 }: Props) {
  const { t } = useI18n();
  const [animated, setAnimated] = useState(0);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const color = getHealthColor(percent);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 150);
    return () => clearTimeout(t);
  }, [percent]);

  const offset = circ - (Math.max(0, Math.min(100, animated)) / 100) * circ;

  return (
    <svg
      className="ring"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={t.healthAria(Math.round(percent))}
    >
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ececef" strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        direction="ltr"
        fontSize="22"
        fontWeight="800"
        fill="#18181b"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {Math.round(animated)}%
      </text>
    </svg>
  );
}
