'use client';

import React, { useState, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { WheelSegment } from '../../lib/wheelConfig';

interface WheelProps {
  segments: WheelSegment[];
  onSpinComplete: (segment: WheelSegment) => void;
  disabled?: boolean;
  selectedSegment?: WheelSegment | null;
}

const Wheel = memo<WheelProps>(({ 
  segments, 
  onSpinComplete, 
  disabled = false,
  selectedSegment = null
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const segmentAngle = 360 / segments.length;
  
  const handleSpin = useCallback(() => {
    if (disabled || spinning || !selectedSegment) return;
    
    setSpinning(true);
    
    // Calculate final rotation to land on the selected segment
    const segmentIndex = segments.findIndex(s => 
      s.label === selectedSegment.label && s.image === selectedSegment.image
    );
    
    if (segmentIndex === -1) {
      console.error('Selected segment not found in segments array');
      setSpinning(false);
      return;
    }
    
    // Calculate the angle to the middle of the segment
    const segmentMiddleAngle = segmentIndex * segmentAngle + (segmentAngle / 2);
    
    // The wheel needs to rotate so that the segment is at the top (270 degrees)
    const segmentPosition = 270 - segmentMiddleAngle;
    
    // Add extra rotations for effect (5-10 full rotations)
    const extraRotations = 5 + Math.floor(Math.random() * 5);
    const finalRotation = rotation + (360 * extraRotations) + segmentPosition;
    
    // Animate the spin with easing
    setRotation(finalRotation);
    
    // Call onSpinComplete after animation ends
    setTimeout(() => {
      setSpinning(false);
      onSpinComplete(selectedSegment);
    }, 5000); // Match this with CSS animation duration
  }, [disabled, spinning, selectedSegment, segments, segmentAngle, rotation, onSpinComplete]);
  
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square touch-none">
      {/* Pointer/Indicator */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-600"></div>
      </div>
      
      <div 
        ref={wheelRef}
        className={`wheel-container w-full h-full rounded-full overflow-hidden transition-transform duration-5000 ease-out`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {segments.map((segment, index) => {
          const startAngle = index * segmentAngle;
          return (
            <div 
              key={index}
              className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right wheel-segment"
              style={{ transform: `rotate(${startAngle}deg)` }}
            >
              <div className="w-full h-full overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src={segment.image} 
                    alt={segment.label}
                    fill
                    className="object-cover"
                    priority={index < 2}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3C/svg%3E"
                  />
                  <div className="absolute bottom-0 left-0 w-full text-center text-white bg-black bg-opacity-50 p-1 text-sm sm:text-base">
                    {segment.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <button
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-bold py-4 px-6 rounded-full z-10 spin-button ${(disabled || spinning || selectedSegment) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'} sm:py-6 sm:px-8 sm:text-lg`}
        onClick={handleSpin}
        disabled={disabled || spinning || !!selectedSegment}
      >
        SPIN
      </button>
    </div>
  );
});

Wheel.displayName = 'Wheel';

export default Wheel; 