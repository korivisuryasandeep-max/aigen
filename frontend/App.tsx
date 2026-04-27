import React, { useState, useCallback } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { useSynth } from './hooks/useSynth';
import { TRACKS } from './constants';

const App: React.FC = () => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastScore, setLastScore] = useState<number | null>(null);

    const currentTrack = TRACKS[currentTrackIndex];
    const { initAudio, isReady } = useSynth(currentTrack, isPlaying);

    const handlePlayPause = useCallback(() => {
        if (!isReady) {
            initAudio();
        }
        setIsPlaying(prev => !prev);
    }, [initAudio, isReady]);

    const handleSkip = useCallback(() => {
        setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
        if (!isPlaying && isReady) {
            setIsPlaying(true);
        }
    }, [isPlaying, isReady]);

    const handleGameOver = useCallback((score: number) => {
        setLastScore(score);
        // Optional: trigger a glitch effect or sound on game over
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-4 left-4 text-xs text-magenta-500/50 hidden md:block">
                <p>SYS.MEM: 0x00F4A2</p>
                <p>NET.STAT: OFFLINE</p>
                <p>AI.CORE: ACTIVE</p>
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-cyan-500/50 hidden md:block text-right">
                <p>V. 1.0.4_BETA</p>
                <p>PROTOCOL: OMEGA</p>
            </div>

            <header className="mb-8 text-center z-10">
                <h1 
                    className="text-5xl md:text-7xl font-bold text-cyan-400 glitch-text tracking-tighter"
                    data-text="NEURAL_SNAKE_OS"
                >
                    NEURAL_SNAKE_OS
                </h1>
                <p className="text-magenta-400 mt-2 tracking-widest text-sm">
                    // BIO-DIGITAL INTERFACE ESTABLISHED //
                </p>
            </header>

            <main className="flex flex-col lg:flex-row gap-8 items-center lg:items-start z-10 w-full max-w-6xl justify-center">
                
                {/* Left Column: Game */}
                <div className="flex-shrink-0">
                    <SnakeGame onGameOver={handleGameOver} />
                </div>

                {/* Right Column: Music & Stats */}
                <div className="flex flex-col gap-6 w-full max-w-md">
                    <MusicPlayer 
                        tracks={TRACKS}
                        currentTrackIndex={currentTrackIndex}
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        onSkip={handleSkip}
                    />

                    {/* Decorative Terminal Box */}
                    <div className="border border-cyan-500/30 p-4 bg-dark/50 text-xs text-cyan-400/70 h-48 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 animate-scanline"></div>
                        <p className="mb-2 text-magenta-400">>> SYSTEM_LOG</p>
                        <p>> INITIALIZING NEURAL LINK...</p>
                        <p>> LINK ESTABLISHED.</p>
                        <p>> LOADING AUDIO SUBSYSTEM...</p>
                        {isReady ? <p className="text-cyan-400">> AUDIO READY.</p> : <p className="animate-pulse">> WAITING FOR USER INPUT...</p>}
                        {isPlaying && <p>> STREAMING TRACK: {currentTrack.id}</p>}
                        {lastScore !== null && (
                            <p className="text-magenta-400 mt-2">> PREVIOUS_SESSION_TERMINATED. SCORE: {lastScore}</p>
                        )}
                        <div className="mt-4 opacity-50">
                            {Array.from({length: 5}).map((_, i) => (
                                <p key={i}>{Math.random().toString(36).substring(2, 15)}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;