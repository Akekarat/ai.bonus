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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading game...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Bonus Wheel</h1>
        
        {game?.played && spinComplete ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image 
                  src={game.result_image!} 
                  alt={game.result_label!}
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Result:</h2>
              <p className="text-xl">{game.result_label}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <Wheel 
            segments={wheelConfig}
            onSpinComplete={handleSpinComplete}
            disabled={game?.played || false}
            selectedSegment={selectedSegment}
          />
        )}
      </main>
    </div>
  );
} 