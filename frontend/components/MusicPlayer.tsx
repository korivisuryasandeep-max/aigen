import React from 'react';
import { Track } from '../types';

interface MusicPlayerProps {
    tracks: Track[];
    currentTrackIndex: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSkip: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
    tracks,
    currentTrackIndex,
    isPlaying,
    onPlayPause,
    onSkip
}) => {
    const currentTrack = tracks[currentTrackIndex];

    return (
        <div className="border-2 border-magenta-500 p-4 bg-dark/80 backdrop-blur-sm w-full max-w-md mx-auto mt-4 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
            <div className="flex justify-between items-center mb-2 border-b border-magenta-500/50 pb-2">
                <span className="text-magenta-400 text-sm uppercase tracking-widest">AUDIO_SUBSYSTEM</span>
                <span className="text-cyan-400 text-xs animate-pulse">
                    {isPlaying ? 'ACTIVE' : 'STANDBY'}
                </span>
            </div>
            
            <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">CURRENT_STREAM:</div>
                <div 
                    className="text-xl text-cyan-400 glitch-text font-bold truncate" 
                    data-text={currentTrack.name}
                >
                    {currentTrack.name}
                </div>
                <div className="text-xs text-magenta-400 mt-1">
                    BPM: {currentTrack.tempo} | TYPE: {currentTrack.type.toUpperCase()}
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={onPlayPause}
                    className="flex-1 border border-cyan-500 text-cyan-400 py-2 hover:bg-cyan-500 hover:text-dark transition-colors uppercase text-sm font-bold focus:outline-none focus:ring-2 focus:ring-magenta-500"
                >
                    {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
                </button>
                <button 
                    onClick={onSkip}
                    className="flex-1 border border-magenta-500 text-magenta-400 py-2 hover:bg-magenta-500 hover:text-dark transition-colors uppercase text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    [ SKIP_SEQ ]
                </button>
            </div>
            
            {/* Fake visualizer */}
            <div className="mt-4 h-8 flex items-end gap-1 overflow-hidden opacity-70">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-full bg-cyan-500 transition-all duration-75 ${isPlaying ? 'animate-pulse' : 'h-1'}`}
                        style={{ 
                            height: isPlaying ? `${Math.random() * 100}%` : '4px',
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};