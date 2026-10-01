"use client";

import React, { useRef, useState, useEffect } from "react";

export interface BorderGlowProps {
  children?: React.ReactNode;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#120F17",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  className = "",
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Distance calculation to the perimeter box
      const dx = Math.max(0, Math.max(-x, x - rect.width));
      const dy = Math.max(0, Math.max(-y, y - rect.height));
      const distance = Math.hypot(dx, dy);

      // Check if within sensitivity radius
      if (distance <= edgeSensitivity + 40) {
        setIsHovered(true);
        setMousePos({ x, y });

        // Proximity fade
        const factor = Math.max(0, 1 - distance / (edgeSensitivity + 40));
        setOpacity(factor * glowIntensity);
      } else {
        setIsHovered(false);
        setOpacity(0);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [edgeSensitivity, glowIntensity]);

  // Color stops for gradient
  const gradientColors = colors.join(", ");

  return (
    <div
      ref={containerRef}
      className={`relative p-[1.5px] transition-all duration-300 ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
    >
      {/* Dynamic Border Glow Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{
          borderRadius: `${borderRadius}px`,
          opacity: opacity,
          background: `radial-gradient(${glowRadius * 3}px circle at ${mousePos.x}px ${mousePos.y}px, ${colors[0]}, ${colors[1] || colors[0]}, ${colors[2] || colors[1] || colors[0]}, transparent 70%)`,
          boxShadow: isHovered
            ? `0 0 ${glowRadius}px rgba(192, 132, 252, ${0.15 * opacity})`
            : "none",
        }}
      />

      {/* Subtle Static Border Base Layer */}
      <div
        className="absolute inset-0 pointer-events-none border border-white/[0.08]"
        style={{
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* Inner Content Surface */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          backgroundColor: backgroundColor,
          borderRadius: `${Math.max(0, borderRadius - 1.5)}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
