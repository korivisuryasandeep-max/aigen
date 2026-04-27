import { useEffect, useRef, useState, useCallback } from 'react';
import { Track } from '../types';

export const useSynth = (currentTrack: Track, isPlaying: boolean) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<number | null>(null);
    const stepRef = useRef(0);
    const [isReady, setIsReady] = useState(false);

    // Initialize AudioContext on first user interaction (required by browsers)
    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            setIsReady(true);
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, []);

    useEffect(() => {
        if (!isPlaying || !audioCtxRef.current) {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const ctx = audioCtxRef.current;
        const playNote = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        };

        const tick = () => {
            const step = stepRef.current;
            
            if (currentTrack.type === 'cyber') {
                // Dark, low, repetitive
                const notes = [65.41, 65.41, 98.00, 65.41, 130.81, 65.41, 73.42, 65.41]; // C2, G2, C3, D2
                if (step % 2 === 0) playNote(notes[step % notes.length], 'square', 0.2, 0.15);
                if (step % 4 === 0) playNote(32.70, 'sawtooth', 0.4, 0.2); // Bass drone
            } else if (currentTrack.type === 'neon') {
                // Fast, arpeggiated, bright
                const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C4, E4, G4, C5
                playNote(notes[step % notes.length], 'sawtooth', 0.1, 0.08);
                if (step % 8 === 0) playNote(130.81, 'square', 0.3, 0.1); // Kick-ish
            } else if (currentTrack.type === 'static') {
                // Dissonant, random, noise-like
                if (Math.random() > 0.5) {
                    playNote(100 + Math.random() * 1000, 'triangle', 0.05, 0.05);
                }
                if (step % 16 === 0) {
                    playNote(50, 'square', 0.8, 0.2); // Deep rumble
                }
            }

            stepRef.current = (step + 1) % 32;
        };

        const intervalTime = (60 / currentTrack.tempo) * 1000 / 4; // 16th notes
        intervalRef.current = window.setInterval(tick, intervalTime);

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, currentTrack, isReady]);

    return { initAudio, isReady };
};