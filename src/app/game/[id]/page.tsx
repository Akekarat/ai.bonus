'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Wheel from '../../../components/Wheel';
import { WheelSegment } from '../../../../lib/wheelConfig';
import { selectRandomSegment } from '../../../../lib/gameLogic';

interface Game {
  id: string;
  created_at: string;
  played: boolean;
  result_label?: string;
  result_image?: string;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [wheelConfig, setWheelConfig] = useState<WheelSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);
  const [spinComplete, setSpinComplete] = useState(false);
  
  // Load game data and wheel config
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        // Load wheel configuration
        const configResponse = await fetch('/api/wheel-config');
        if (!configResponse.ok) {
          throw new Error('Failed to load wheel configuration');
        }
        const config = await configResponse.json();
        setWheelConfig(config);
        
        // Load game state
        const gameResponse = await fetch(`/api/games/${id}`);
        
        if (!gameResponse.ok) {
          if (gameResponse.status === 404) {
            setError('Game not found');
          } else {
            setError('Failed to load game');
          }
          setLoading(false);
          return;
        }
        
        const gameData = await gameResponse.json();
        setGame(gameData);
        
        // If game already played, set the result
        if (gameData.played) {
          const playedSegment = config.find((s: WheelSegment) => s.label === gameData.result_label);
          if (playedSegment) {
            setSelectedSegment(playedSegment);
            setSpinComplete(true);
          }
        } else {
          // Pre-determine the result for new game
          const result = selectRandomSegment(config);
          setSelectedSegment(result);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleSpinComplete = async (segment: WheelSegment) => {
    setSpinComplete(true);
    
    // Save result to database
    try {
      await fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result_label: segment.label,
          result_image: segment.image,
        }),
      });
      
      // Update local game state
      setGame(prev => prev ? ({
        ...prev,
        played: true,
        result_label: segment.label,
        result_image: segment.image,
      }) : null);
    } catch (err) {
      console.error('Error saving game result:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-xl">Loading game...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md mx-auto px-4 sm:px-0">
        {!(game?.played && spinComplete) && (
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">รางวัลพิเศษ</h1>
        )}
        
        {!(game?.played && spinComplete) && (
          <Wheel 
            segments={wheelConfig}
            onSpinComplete={handleSpinComplete}
            disabled={game?.played || false}
            selectedSegment={selectedSegment}
          />
        )}
        {game?.played && spinComplete && (
          <div className="text-center mt-6">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4">
              <Image 
                src={game.result_image!} 
                alt={game.result_label!}
                fill
                className="object-contain"
              />
            </div>
           <p className="text-[50px] font-bold leading-tight">คุณได้: {game.result_label}</p>
          </div>
        )}
      </main>
    </div>
  );
} 