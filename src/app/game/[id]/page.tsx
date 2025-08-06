'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  wheel_count?: number;
  results_csv?: string; // CSV format: "label1,label2,label3"
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  // Parse wheel count from id (format: '05_xxxxx-...')
  const wheelCount = useMemo(() => {
    if (id && id.includes('_')) {
      const prefix = id.split('_')[0];
      const parsed = parseInt(prefix, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) return parsed;
    }
    return 1;
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [wheelConfig, setWheelConfig] = useState<WheelSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<(WheelSegment | null)[]>(Array(wheelCount).fill(null));
  const [spinComplete, setSpinComplete] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState<boolean[]>(Array(wheelCount).fill(false));
  
  // Load game data and wheel config
  useEffect(() => {
    if (!id) return;
    
    console.log('[GamePage] Decoded wheelCount:', wheelCount, 'from id:', id);
    
    // Recompute selectedSegments if wheelCount changes
    setSelectedSegments(Array(wheelCount).fill(null));

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
        
        // If game already played, load results from database
        if (gameData.played) {
          setSpinComplete(true);
          
          // Load results from CSV if available
          if (gameData.results_csv) {
            const resultLabels = gameData.results_csv.split(',');
            const results = resultLabels.map((label: string) => 
              config.find((segment: WheelSegment) => segment.label === label) || null
            );
            setSelectedSegments(results);
          } else if (gameData.result_label) {
            // Fallback for single wheel results
            const segment = config.find((s: WheelSegment) => s.label === gameData.result_label);
            if (segment) {
              setSelectedSegments([segment]);
            }
          }
        } else {
          // Pre-determine results for each wheel (but don't save yet)
          const results = Array(wheelCount).fill(null).map(() => selectRandomSegment(config));
          setSelectedSegments(results);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, wheelCount]);
  
  // Multi-wheel spin handler
  const handleSpinAll = async () => {
    if (game?.played) {
      console.log('Game already played, cannot spin again');
      return;
    }
    
    setSpinning(true);
    setSpun(Array(wheelCount).fill(false));
  };

  // When all wheels are done spinning, save results to database
  useEffect(() => {
    if (spinning && spun.every(Boolean)) {
      const saveResults = async () => {
        try {
          // Extract result labels from selected segments
          const resultLabels = selectedSegments
            .filter(segment => segment !== null)
            .map(segment => segment!.label);
          
          // Save results to database
          const response = await fetch(`/api/games/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              results: resultLabels
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to save results to database');
            setError('เคยหมุนไปแล้ว');
            return;
          }
          
          // Update local game state
          setGame(prev => prev ? ({ ...prev, played: true, results_csv: resultLabels.join(',') }) : null);
          setSpinComplete(true);
          setSpinning(false);
        } catch (error) {
          console.error('Error saving results:', error);
          setError('Failed to save game results');
        }
      };
      
      saveResults();
    }
  }, [spinning, spun, selectedSegments, id]);
  
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
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-0">
        {!(game?.played && spinComplete) && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">รางวัลพิเศษ</h1>
            <button
              className="block mx-auto mb-8 bg-blue-600 text-white font-extrabold py-4 px-12 rounded-2xl text-2xl shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: 220, minHeight: 64 }}
              onClick={handleSpinAll}
              disabled={game?.played || spinComplete}
            >
              หมุนทั้งหมด
            </button>
            <div className={`grid gap-6 ${wheelCount > 2 ? 'grid-cols-2' : 'grid-cols-1'} justify-items-center`}>
              {selectedSegments.map((segment, idx) => (
                <Wheel
                  key={idx}
                  segments={wheelConfig}
                  onSpinComplete={() => {
                    setSpun(prev => {
                      const updated = [...prev];
                      updated[idx] = true;
                      return updated;
                    });
                  }}
                  disabled={game?.played || (spinning ? false : true)}
                  selectedSegment={segment}
                  spinning={spinning && !spun[idx]}
                />
              ))}
            </div>
          </>
        )}
        {game?.played && spinComplete && (
          <div className="text-center mt-6">
            <GroupedResults segments={selectedSegments} />
          </div>
        )}
      </main>
    </div>
  );
}

// Helper component to group and display results in a table, no images, bigger font
function GroupedResults({ segments }: { segments: (WheelSegment|null)[] }) {
  if (!segments || segments.length === 0) return null;
  const counts: Record<string, {count: number}> = {};
  segments.forEach(seg => {
    if (!seg) return;
    if (!counts[seg.label]) counts[seg.label] = { count: 0 };
    counts[seg.label].count++;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  return (
    <div className="w-full flex flex-col items-center mt-8">
      <h2 className="text-3xl font-extrabold mb-6">ผลลัพธ์ทั้งหมด</h2>
      <table className="w-full max-w-xl text-center border-separate border-spacing-y-3" style={{ width: '300px', fontSize: 'xx-large' }}>
        <thead>
          <tr className="text-2xl font-bold text-gray-800">
            <th className="pb-2">รางวัล</th>
            <th className="pb-2">จำนวนครั้ง</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([label, {count}]) => (
            <tr key={label} className="bg-gray-100 rounded-2xl">
              <td className="py-4 px-6 text-2xl font-extrabold">{label}</td>
              <td className="py-4 px-6 text-blue-700 text-3xl font-black">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}