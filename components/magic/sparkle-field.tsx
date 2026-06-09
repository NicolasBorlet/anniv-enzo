"use client";

import { useMemo } from "react";

const SPARKLE_COLORS = [
  "#ec4899",
  "#d946ef",
  "#f472b6",
  "#fbbf24",
  "#e879f9",
  "#a78bfa",
  "#ffffff",
  "#f9a8d4",
] as const;

type Particle = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  color: (typeof SPARKLE_COLORS)[number];
  variant: "dot" | "star" | "diamond";
  opacity: number;
};

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 5,
    delay: Math.random() * 10,
    duration: 4 + Math.random() * 6,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    variant: (["dot", "star", "diamond"] as const)[Math.floor(Math.random() * 3)],
    opacity: 0.3 + Math.random() * 0.7,
  }));
}

export function SparkleField() {
  const particles = useMemo(() => createParticles(55), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-1 overflow-hidden motion-reduce:hidden"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={[
            "sparkle-particle absolute",
            particle.variant === "star" && "sparkle-particle--star",
            particle.variant === "diamond" && "sparkle-particle--diamond",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            {
              "--sparkle-left": `${particle.left}%`,
              "--sparkle-top": `${particle.top}%`,
              "--sparkle-size": `${particle.size}px`,
              "--sparkle-delay": `${particle.delay}s`,
              "--sparkle-duration": `${particle.duration}s`,
              "--sparkle-color": particle.color,
              "--sparkle-opacity": particle.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
