import React from "react";

// Modern animated SVG fire for Duolingo-style effect
const FireAnimation: React.FC = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    <defs>
      <radialGradient id="fireGlow" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stopColor="#fffbe6" stopOpacity="1" />
        <stop offset="60%" stopColor="#ffd740" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#ff9800" stopOpacity="0.3" />
      </radialGradient>
      <linearGradient id="fireMain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fffbe6" />
        <stop offset="40%" stopColor="#ffd740" />
        <stop offset="100%" stopColor="#ff9800" />
      </linearGradient>
      <linearGradient id="fireEdge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd740" />
        <stop offset="100%" stopColor="#ff5722" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Glow */}
    <ellipse
      cx="100"
      cy="140"
      rx="60"
      ry="40"
      fill="url(#fireGlow)"
      filter="url(#glow)"
      opacity="0.7"
    >
      <animate
        attributeName="rx"
        values="60;70;60"
        dur="1.2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.7;1;0.7"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </ellipse>
    {/* Main fire body */}
    <path
      d="M100 160 Q90 120 110 100 Q120 80 100 60 Q80 80 90 100 Q110 120 100 160 Z"
      fill="url(#fireMain)"
      filter="url(#glow)"
    >
      <animate
        attributeName="d"
        values="M100 160 Q90 120 110 100 Q120 80 100 60 Q80 80 90 100 Q110 120 100 160 Z;
                M100 160 Q85 120 115 100 Q120 80 100 60 Q80 80 95 100 Q115 120 100 160 Z;
                M100 160 Q90 120 110 100 Q120 80 100 60 Q80 80 90 100 Q110 120 100 160 Z"
        dur="1.1s"
        repeatCount="indefinite"
      />
    </path>
    {/* Fire edge flicker */}
    <path
      d="M100 160 Q95 130 105 110 Q110 100 100 90 Q90 100 95 110 Q105 130 100 160 Z"
      fill="url(#fireEdge)"
      opacity="0.7"
    >
      <animate
        attributeName="d"
        values="M100 160 Q95 130 105 110 Q110 100 100 90 Q90 100 95 110 Q105 130 100 160 Z;
                M100 160 Q97 135 103 115 Q110 100 100 90 Q90 100 97 115 Q103 135 100 160 Z;
                M100 160 Q95 130 105 110 Q110 100 100 90 Q90 100 95 110 Q105 130 100 160 Z"
        dur="0.9s"
        repeatCount="indefinite"
      />
    </path>
    {/* Embers */}
    <circle cx="120" cy="110" r="3" fill="#ffd740">
      <animate
        attributeName="cy"
        values="110;90;110"
        dur="1.3s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="1;0;1"
        dur="1.3s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="90" cy="120" r="2" fill="#fffbe6">
      <animate
        attributeName="cy"
        values="120;100;120"
        dur="1.1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="1;0;1"
        dur="1.1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default FireAnimation;
