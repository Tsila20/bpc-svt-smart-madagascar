import React from 'react';

export const RobotAvatar = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head */}
    <rect x="25" y="20" width="50" height="45" rx="12" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="3"/>
    
    {/* Eyes */}
    <circle cx="40" cy="40" r="4" fill="#2E7D32"/>
    <circle cx="60" cy="40" r="4" fill="#2E7D32"/>
    
    {/* Smile */}
    <path d="M40 52C40 52 45 56 50 56C55 56 60 52 60 52" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Antennas */}
    <line x1="50" y1="20" x2="50" y2="10" stroke="#C62828" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="8" r="3" fill="#C62828"/>
    
    {/* Body Accents */}
    <rect x="35" y="65" width="30" height="15" rx="4" fill="#2E7D32"/>
    
    {/* Madagascar Flag Element */}
    <g transform="translate(70, 45) scale(0.15)">
      <rect width="100" height="60" fill="white" stroke="#E5E5E0" strokeWidth="2"/>
      <rect x="33" width="67" height="30" fill="#C62828"/>
      <rect x="33" y="30" width="67" height="30" fill="#2E7D32"/>
    </g>
    
    {/* Glow effect */}
    <circle cx="50" cy="50" r="45" stroke="#2E7D32" strokeOpacity="0.1" strokeWidth="2"/>
  </svg>
);
