'use client';

import React, { useState, useRef, useCallback } from 'react';
import { WheelSegment } from '../../lib/wheelConfig';

interface WheelProps {
  segments: WheelSegment[];
  onSpinComplete: (segment: WheelSegment) => void;
  disabled?: boolean;
  selectedSegment?: WheelSegment | null;
  spinning?: boolean;
}

const Wheel: React.FC<WheelProps> = ({ 
  segments, 
  onSpinComplete, 
  disabled = false,
  selectedSegment = null,
  spinning: spinningProp = false,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const wheelRef = useRef<SVGSVGElement | null>(null);
  
  const handleSpin = useCallback(() => {
    if (disabled || spinning || !selectedSegment) return;
    setSpinning(true);
    // Calculate final rotation to land on the selected segment
    const segmentIndex = segments.findIndex((s: WheelSegment) => s.label === selectedSegment!.label && s.image === selectedSegment!.image);
    
    if (segmentIndex === -1) {
      console.error('Selected segment not found in segments array');
      setSpinning(false);
      return;
    }
    
    // Calculate cumulative angles using displayPercentage
    let currentAngle = 0;
    let targetStart = 0;
    let targetEnd = 0;
    for (let i = 0; i < segments.length; i++) {
      const percentage = segments[i].displayPercentage ?? (100 / segments.length);
      const angle = (percentage / 100) * 360;
      if (i === segmentIndex) {
        targetStart = currentAngle;
        targetEnd = currentAngle + angle;
        break;
      }
      currentAngle += angle;
    }
    const segmentMiddleAngle = targetStart + (targetEnd - targetStart) / 2;
    // The wheel needs to rotate so that the segment is at the right (0 degrees)
    const segmentPosition = 90 - segmentMiddleAngle;
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
  }, [disabled, spinning, selectedSegment, segments, rotation, onSpinComplete]);

  // Trigger spin when spinningProp is true
  React.useEffect(() => {
    if (spinningProp && !spinning && selectedSegment) {
      handleSpin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinningProp, selectedSegment]);

  // --- SVG helpers ---
  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(rad)),
      y: cy + (r * Math.sin(rad))
    };
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[300px] mx-auto">
      <div className="relative aspect-square w-full" style={{ maxWidth: 300, maxHeight: 300 }}>
        {/* Pointer/Indicator (right edge, fixed) */}
        <div className="absolute" style={{ top: 'calc(50% + 12px)', right: '-32px', transform: 'translateY(-50%)' }}>
          <div className="w-0 h-0 border-t-[20px] border-b-[20px] border-r-[30px] border-t-transparent border-b-transparent border-r-red-600"></div>
        </div>
        <svg
          ref={wheelRef}
          className="wheel-container w-full h-full rounded-full overflow-visible transition-transform duration-5000 ease-out"
          style={{ transform: `rotate(${rotation}deg)`, width: '100%', height: '100%' , borderColor: 'transparent'}}
          viewBox="0 0 300 300"
        >
        {(() => {
          let currentAngle = 0;
          return segments.map((segment: WheelSegment, index: number) => {
            const percentage = segment.displayPercentage ?? (100 / segments.length);
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;
            // Arc path
            const r = 140; // radius for arc
            const cx = 150, cy = 150;
            const start = polarToCartesian(cx, cy, r, endAngle);
            const end = polarToCartesian(cx, cy, r, startAngle);
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              `M ${cx} ${cy}`,
              `L ${start.x} ${start.y}`,
              `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
              'Z'
            ].join(' ');
            // Color
            const palette = [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#43AA8B', '#F94144', '#F3722C', '#F8961E', '#577590', '#277DA1'
            ];
            const fill = segment.color || palette[index % palette.length];
            // Image position (middle of arc)
            const midAngle = startAngle + angle / 2;
            const imgPos = polarToCartesian(cx, cy, r * 0.6, midAngle);
            // Straight, centered section text variables
            const sectionText = segment.text || segment.label;
            const angleCenter = startAngle + angle / 2;
            const textRadius = 100;
            const textPos = polarToCartesian(cx, cy, textRadius, angleCenter);
            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={3}
                  className="wheel-segment"
                />
                {/* Image */}
                <image
                  href={segment.image}
                  x={imgPos.x - 15}
                  y={imgPos.y - 15}
                  width={30}
                  height={30}
                  style={{ pointerEvents: 'none', visibility: 'hidden' }}
                />
                {/* Straight, centered section text */}
                <text
                  x={textPos.x}
                  y={textPos.y}
                  fontSize="13"
                  fontWeight="bold"
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${angleCenter - 90} ${textPos.x} ${textPos.y})`}
                >
                  {sectionText}
                </text>
              </g>
            );
          });
        })()}
      </svg>
      </div>
      <br/>
      <br/>

    </div>
  );
}

export default Wheel;