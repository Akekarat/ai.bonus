'use client';

import { useState } from 'react';

export default function Home() {
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateGameLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate game link');
      }
      
      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.url}`;
      setGameUrl(fullUrl);
    } catch (error) {
      console.error('Error generating game link:', error);
      alert('Failed to generate game link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!gameUrl) return;
    
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <main className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Bonus App</h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Generate a unique game link to share with others. Each link can only be played once!
        </p>
        
        <button
          onClick={generateGameLink}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-6 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Game Link'}
        </button>
        
        {gameUrl && (
          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="text"
                value={gameUrl}
                readOnly
                className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={copyToClipboard}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-lg"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Share this link with someone to let them play the game. The link can only be used once.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
