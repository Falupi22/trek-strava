import { useEffect, useState } from "react";
import { getHealthColor, getHealthLabel } from "@bikehealth/shared";

interface Props {
  percent: number;
  size?: number;
  label: string;
  icon: string;
}

export default function DonutChart({ percent, size = 110, label, icon }: Props) {
  const [animated, setAnimated] = useState(0);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const color = getHealthColor(percent);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 300);
    return () => clearTimeout(t);
  }, [percent]);

  const offset = circ - (animated / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Track ring — light gray on white background */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e8e8e8" strokeWidth="10" />
        {/* Health arc */}
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
        {/* Percentage — dark on white */}
        <text x="50" y="47" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#363636" fontFamily="sans-serif">
          {Math.round(animated)}%
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="10" fill="#555555" fontFamily="sans-serif">
          {getHealthLabel(percent)}
        </text>
      </svg>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ color: "#555555", fontSize: 12, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
