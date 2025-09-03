import React from "react";

interface HeartbeatAnimationProps {
  className?: string;
  strokeColor?: string;
  duration?: number; // time for one beat draw
}

export const HeartbeatAnimation: React.FC<HeartbeatAnimationProps> = ({
  className = "",
  strokeColor = "#06b6d1", // cyan-500
  duration = 3, // seconds
}) => {
  // Path with higher crests/troughs
  const pathD = `
    M0,32 
    L100,32 L110,12 L120,52 L130,8 L140,32
    L200,32 L210,16 L220,48 L230,32
    L300,32 L310,12 L320,52 L330,32
    L400,32 L410,18 L420,46 L430,32
    L500,32 L510,10 L520,54 L530,32
    L600,32 L610,14 L620,50 L630,32
    L700,32 L710,12 L720,52 L730,32
    L800,32 L810,18 L820,46 L830,32
    L900,32 L910,10 L920,54 L930,32
    L1000,32 L1010,14 L1020,50 L1030,32
    L1100,32 L1110,12 L1120,52 L1130,32 
    L1200,32
  `;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <svg
        className="absolute top-1/2 -translate-y-1/2 w-full h-20 opacity-90"
        viewBox="0 0 1200 64"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="heartbeat-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor={strokeColor} stopOpacity="0.8" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="80%" stopColor={strokeColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <path
          d={pathD}
          stroke="url(#heartbeat-gradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1200, // length of path
            strokeDashoffset: 1200,
            animation: `draw ${duration}s linear infinite`,
          }}
        />
      </svg>

      <style>
        {`
          @keyframes draw {
            0% {
              stroke-dashoffset: 1200;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default HeartbeatAnimation;
