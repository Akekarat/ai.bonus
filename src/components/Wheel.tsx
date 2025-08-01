'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { WheelSegment } from '../../lib/wheelConfig';

interface WheelProps {
  segments: WheelSegment[];
  onSpinComplete: (segment: WheelSegment) => void;
  disabled?: boolean;
  selectedSegment?: WheelSegment | null;
}

const Wheel: React.FC<WheelProps> = ({ 
  segments, 
  onSpinComplete, 
  disabled = false,
  selectedSegment = null
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const segmentAngle = 360 / segments.length;
  
  const handleSpin = () => {
    if (disabled || spinning || selectedSegment) return;
    
    setSpinning(true);
    
    // Calculate final rotation to land on the selected segment
    const segmentIndex = segments.indexOf(selectedSegment!);
    const segmentPosition = 360 - (segmentIndex * segmentAngle);
    
    // Add extra rotations for effect (5-10 full rotations)
    const extraRotations = 5 + Math.floor(Math.random() * 5);
    const finalRotation = rotation + (360 * extraRotations) + segmentPosition;
    
    // Animate the spin
    setRotation(finalRotation);
    
    // Call onSpinComplete after animation ends
    setTimeout(() => {
      setSpinning(false);
      onSpinComplete(selectedSegment!);
    }, 5000); // Match this with CSS animation duration
  };
  
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
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
              className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right"
              style={{ transform: `rotate(${startAngle}deg)` }}
            >
              <div className="w-full h-full overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src={segment.image} 
                    alt={segment.label}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full text-center text-white bg-black bg-opacity-50 p-1">
                    {segment.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <button
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-bold py-4 px-6 rounded-full z-10 ${(disabled || spinning || selectedSegment) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
        onClick={handleSpin}
        disabled={disabled || spinning || !!selectedSegment}
      >
        SPIN
      </button>
    </div>
  );
};

export default Wheel; 