import fs from 'fs';
import path from 'path';

export interface WheelSegment {
  label: string;
  image: string;
  chance: number;
}

export type WheelConfig = WheelSegment[];

export async function loadWheelConfig(): Promise<WheelConfig> {
  const configPath = path.join(process.cwd(), 'config', 'wheel.json');
  const configData = await fs.promises.readFile(configPath, 'utf8');
  const config: WheelConfig = JSON.parse(configData);
  
  // Validate config
  if (!Array.isArray(config) || config.length < 2) {
    throw new Error('Invalid wheel configuration: must be an array with at least 2 segments');
  }
  
  // Validate each segment has required fields
  for (let i = 0; i < config.length; i++) {
    const segment = config[i];
    if (!segment.label || !segment.image || typeof segment.chance !== 'number') {
      throw new Error(`Invalid segment at index ${i}: missing required fields`);
    }
    if (segment.chance < 0 || segment.chance > 1) {
      throw new Error(`Invalid segment at index ${i}: chance must be between 0 and 1`);
    }
  }
  
  // Validate total chance adds up to approximately 1
  const totalChance = config.reduce((sum, segment) => sum + segment.chance, 0);
  if (Math.abs(totalChance - 1) > 0.001) {
    throw new Error(`Invalid wheel configuration: chances must sum to 1, got ${totalChance}`);
  }
  
  return config;
}

export function validateWheelConfig(config: WheelConfig): boolean {
  try {
    if (!Array.isArray(config) || config.length < 2) {
      return false;
    }
    
    for (const segment of config) {
      if (!segment.label || !segment.image || typeof segment.chance !== 'number') {
        return false;
      }
      if (segment.chance < 0 || segment.chance > 1) {
        return false;
      }
    }
    
    const totalChance = config.reduce((sum, segment) => sum + segment.chance, 0);
    return Math.abs(totalChance - 1) <= 0.001;
  } catch {
    return false;
  }
} 