import { WheelSegment } from './wheelConfig';

export function selectRandomSegment(segments: WheelSegment[]): WheelSegment {
  // Validate segments
  if (!segments || segments.length === 0) {
    throw new Error('No segments provided');
  }
  
  // Generate random number between 0 and 1
  const random = Math.random();
  
  // Use cumulative probability to select segment
  let cumulativeProbability = 0;
  
  for (const segment of segments) {
    cumulativeProbability += segment.chance;
    
    if (random <= cumulativeProbability) {
      return segment;
    }
  }
  
  // Fallback to last segment (should rarely happen due to floating point precision)
  return segments[segments.length - 1];
}

export function validateSegmentChances(segments: WheelSegment[]): boolean {
  const sum = segments.reduce((total, segment) => total + segment.chance, 0);
  return Math.abs(sum - 1) < 0.001; // Allow small floating point error
}

export function getSegmentIndex(segments: WheelSegment[], selectedSegment: WheelSegment): number {
  return segments.findIndex(segment => 
    segment.label === selectedSegment.label && 
    segment.image === selectedSegment.image && 
    segment.chance === selectedSegment.chance
  );
}

export function calculateSegmentAngle(segments: WheelSegment[]): number {
  return 360 / segments.length;
}

export function calculateFinalRotation(
  segments: WheelSegment[], 
  selectedSegment: WheelSegment, 
  currentRotation: number
): number {
  const segmentIndex = getSegmentIndex(segments, selectedSegment);
  const segmentAngle = calculateSegmentAngle(segments);
  const segmentPosition = 360 - (segmentIndex * segmentAngle);
  
  // Add extra rotations for effect (5-10 full rotations)
  const extraRotations = 5 + Math.floor(Math.random() * 5);
  const finalRotation = currentRotation + (360 * extraRotations) + segmentPosition;
  
  return finalRotation;
} 