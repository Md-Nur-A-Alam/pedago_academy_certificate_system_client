'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Trophy, 
  Award, 
  Mail, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';

const funnyExcuses = [
  "The dog ate this webpage's CSS stylesheet.",
  "This page scored 100% on the Math Olympiad and graduated early to Hawaii.",
  "A sudden gust of wind blew this certificate right out of the server window!",
  "My little brother mashed the backspace key while trying to play Roblox.",
  "Error 404: Webpage is currently in detention finishing its homework.",
  "The server admin spilled morning tea and this URL had to learn how to swim.",
  "Detective Star searched under every desk... and only found a half-eaten eraser!",
  "The link took a wrong turn at Dhanmondi Lake and got stuck in traffic.",
];

export default function NotFound() {
  const [excuseIndex, setExcuseIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleNextExcuse = () => {
    setIsSpinning(true);
    setExcuseIndex((prev) => (prev + 1) % funnyExcuses.length);
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16 bg-gradient-to-b from-[#F4F7FC] via-white to-[#F4F7FC] relative overflow-hidden">
      
      {/* Ambient background decorative floating glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#29479B]/8 via-[#F0442E]/5 to-[#F59E0B]/8 blur-3xl -z-10 rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Floating Paper Airplane */}
      <div className="absolute top-16 right-8 sm:right-24 pointer-events-none animate-paper-plane opacity-75 hidden md:block">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M5 28 L52 8 L32 55 L24 35 Z" fill="#29479B" opacity="0.85" />
          <path d="M24 35 L52 8 L24 28 Z" fill="#1E3A8A" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
        
        {/* Top Playful Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] text-[#F0442E] text-xs sm:text-sm font-semibold shadow-2xs animate-bounce">
          <Sparkles className="w-4 h-4 text-[#F0442E]" />
          <span>Case #404 • Missing Certificate of Existence</span>
        </div>

        {/* The Animated 404 Mascot Centerpiece */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 my-2 select-none">
          
          {/* Left '4' */}
          <span className="text-7xl sm:text-9xl font-extrabold text-[#29479B] tracking-tight drop-shadow-sm animate-float">
            4
          </span>

          {/* Center Mascot '0': Detective Graduation Star */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center animate-wobble">
            
            <div className="absolute inset-0 bg-[#F59E0B]/20 rounded-full blur-xl -z-10" />

            <svg
              viewBox="0 0 160 160"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 80 20 
                   L 94 54 
                   L 130 58 
                   L 102 84 
                   L 110 120 
                   L 80 102 
                   L 50 120 
                   L 58 84 
                   L 30 58 
                   L 66 54 
                   Z"
                fill="#FFB733"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              <circle cx="63" cy="82" r="4.5" fill="#FCA5A5" opacity="0.9" />
              <circle cx="97" cy="82" r="4.5" fill="#FCA5A5" opacity="0.9" />

              <ellipse cx="69" cy="74" rx="6.5" ry="8" fill="#FFFFFF" stroke="#1A284A" strokeWidth="1.5" />
              <ellipse cx="91" cy="74" rx="6.5" ry="8" fill="#FFFFFF" stroke="#1A284A" strokeWidth="1.5" />

              <g className="animate-eye-pupil">
                <circle cx="69" cy="74" r="3.2" fill="#1A284A" />
                <circle cx="70.5" cy="72.5" r="1.1" fill="#FFFFFF" />

                <circle cx="91" cy="74" r="3.2" fill="#1A284A" />
                <circle cx="92.5" cy="72.5" r="1.1" fill="#FFFFFF" />
              </g>

              <path
                d="M 74 84 Q 80 89 86 84"
                stroke="#1A284A"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />

              <g transform="translate(100, 75) rotate(-20)">
                <circle cx="12" cy="12" r="10" stroke="#29479B" strokeWidth="2.5" fill="#EBF2FE" opacity="0.7" />
                <line x1="19" y1="19" x2="28" y2="28" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                <path d="M 6 8 A 6 6 0 0 1 14 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              <g transform="translate(10, -5) rotate(8, 80, 20)">
                <polygon points="80,12 105,25 80,38 55,25" fill="#1A284A" />
                <polygon points="80,14 103,25 80,36 57,25" fill="#243763" />
                <circle cx="80" cy="25" r="2.5" fill="#F59E0B" />
                <path d="M 80 25 C 90 25 98 34 100 42" stroke="#DC2626" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="43" r="2" fill="#991B1B" />
              </g>

              <text x="32" y="32" fill="#F0442E" fontSize="18" fontWeight="bold" fontFamily="system-ui" className="animate-float-reverse">
                ?
              </text>
            </svg>
          </div>

          {/* Right '4' */}
          <span className="text-7xl sm:text-9xl font-extrabold text-[#F0442E] tracking-tight drop-shadow-sm animate-float-reverse">
            4
          </span>

        </div>

        {/* Headlines */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1A284A]">
            Even Our Gold Medalists Couldn&apos;t Find This Page!
          </h1>
          <p className="text-sm sm:text-base text-[#1A284A]/75 max-w-xl mx-auto leading-relaxed">
            The link you followed might be broken, or this page has wandered off to participate in recess.
            Don&apos;t worry, no detention slips will be issued today!
          </p>
        </div>

        {/* Student Excuse Generator Box */}
        <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-[#E4EAF5] p-5 shadow-sm text-left relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between gap-3 border-b border-[#E4EAF5] pb-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#29479B] flex items-center gap-1.5">
              <span>🎒</span> Official Student Excuse #{excuseIndex + 1}
            </span>
            <button
              onClick={handleNextExcuse}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#29479B] hover:text-[#F0442E] transition-colors"
              title="Roll another excuse"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>Roll Next Excuse</span>
            </button>
          </div>

          <p className="text-sm sm:text-base font-medium text-[#1A284A] italic leading-relaxed">
            &ldquo;{funnyExcuses[excuseIndex]}&rdquo;
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="bg-[#29479B] hover:bg-[#1f377a] text-white font-semibold px-6 py-3.5 rounded-full shadow-md shadow-[#29479B]/20 hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Back to Safety (Home)</span>
          </Link>

          <Link
            href="/competitions"
            className="bg-[#FDE7C7] hover:bg-[#FCD8A5] text-[#78350F] font-semibold px-6 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 text-sm"
          >
            <Trophy className="w-4 h-4" />
            <span>Explore Competitions</span>
          </Link>

          <Link
            href="/certificates"
            className="bg-white hover:bg-[#F4F7FC] text-[#29479B] border border-[#E4EAF5] font-semibold px-5 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 text-sm"
          >
            <Award className="w-4 h-4" />
            <span>Find Certificates</span>
          </Link>

          <Link
            href="/contact"
            className="text-xs sm:text-sm font-semibold text-[#1A284A]/70 hover:text-[#29479B] flex items-center gap-1.5 px-3 py-2 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Report Broken Link</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
