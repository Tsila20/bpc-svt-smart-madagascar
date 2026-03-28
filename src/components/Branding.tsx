import React from 'react';

export const AppLogo = ({ className = "w-24 h-24" }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100`}>
    {/* Robot Head */}
    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <rect x="20" y="25" width="60" height="50" rx="15" fill="white" stroke="#2E7D32" strokeWidth="4"/>
        
        {/* Eyes (Digital/Friendly) */}
        <rect x="35" y="40" width="10" height="10" rx="2" fill="#2E7D32"/>
        <rect x="55" y="40" width="10" height="10" rx="2" fill="#2E7D32"/>
        
        {/* Smile */}
        <path d="M40 60C40 60 45 65 50 65C55 65 60 60 60 60" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round"/>
        
        {/* Antenna */}
        <line x1="50" y1="25" x2="50" y2="15" stroke="#C62828" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="50" cy="12" r="5" fill="#C62828"/>
        
        {/* Madagascar Flag Badge */}
        <g transform="translate(70, 60) scale(0.2)">
          <rect width="100" height="60" fill="white" stroke="#E5E5E0" strokeWidth="2"/>
          <rect x="33" width="67" height="30" fill="#C62828"/>
          <rect x="33" y="30" width="67" height="30" fill="#2E7D32"/>
        </g>
      </svg>
    </div>
    
    {/* Name Overlay (Subtle) */}
    <div className="absolute bottom-1 left-0 right-0 text-center">
      <p className="text-[6px] font-bold text-mad-green uppercase tracking-tighter">BPC SVT Smart</p>
    </div>
  </div>
);

export const MadagascarMap = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none ${className}`}>
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Madagascar_map.svg/800px-Madagascar_map.svg.png" 
      alt="Madagascar Map"
      className="w-full h-full object-contain opacity-5 grayscale brightness-150"
    />
  </div>
);
