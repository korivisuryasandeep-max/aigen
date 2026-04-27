import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Point, Direction } from '../types';
import { GRID_SIZE, INITIAL_SPEED } from '../constants';

interface SnakeGameProps {
    onGameOver: (score: number) => void;
}

const generateFood = (snake: Point[]): Point => {
    let newFood: Point;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        // eslint-disable-next-line no-loop-func
        const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!isOnSnake) break;
    }
    return newFood;
};

export const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver }) => {
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [direction, setDirection] = useState<Direction>(Direction.UP);
    const [food, setFood] = useState<Point>({ x: 5, y: 5 });
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Refs to hold latest state for the game loop to avoid stale closures
    const directionRef = useRef(direction);
    const snakeRef = useRef(snake);
    const isGameOverRef = useRef(isGameOver);
    const isPausedRef = useRef(isPaused);

    // Update refs when state changes
    useEffect(() => { directionRef.current = direction; }, [direction]);
    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    const resetGame = useCallback(() => {
        setSnake([{ x: 10, y: 10 }]);
        setDirection(Direction.UP);
        setScore(0);
        setIsGameOver(false);
        setFood(generateFood([{ x: 10, y: 10 }]));
        setIsPaused(false);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isGameOverRef.current) {
            if (e.key === 'Enter') resetGame();
            return;
        }

        if (e.key === 'p' || e.key === 'P') {
            setIsPaused(prev => !prev);
            return;
        }

        const currentDir = directionRef.current;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (currentDir !== Direction.DOWN) setDirection(Direction.UP);
                break;
            case 'ArrowDown':
            case 's':
                if (currentDir !== Direction.UP) setDirection(Direction.DOWN);
                break;
            case 'ArrowLeft':
            case 'a':
                if (currentDir !== Direction.RIGHT) setDirection(Direction.LEFT);
                break;
            case 'ArrowRight':
            case 'd':
                if (currentDir !== Direction.LEFT) setDirection(Direction.RIGHT);
                break;
        }
    }, [resetGame]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const moveSnake = () => {
            if (isGameOverRef.current || isPausedRef.current) return;

            const currentSnake = [...snakeRef.current];
            const head = { ...currentSnake[0] };
            const currentDir = directionRef.current;

            switch (currentDir) {
                case Direction.UP: head.y -= 1; break;
                case Direction.DOWN: head.y += 1; break;
                case Direction.LEFT: head.x -= 1; break;
                case Direction.RIGHT: head.x += 1; break;
            }

            // Collision with walls
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setIsGameOver(true);
                onGameOver(score);
                return;
            }

            // Collision with self
            if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setIsGameOver(true);
                onGameOver(score);
                return;
            }

            currentSnake.unshift(head);

            // Check food
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                setFood(generateFood(currentSnake));
                // Don't pop, snake grows
            } else {
                currentSnake.pop();
            }

            setSnake(currentSnake);
        };

        const speed = Math.max(50, INITIAL_SPEED - (Math.floor(score / 50) * 10));
        const gameLoop = setInterval(moveSnake, speed);

        return () => clearInterval(gameLoop);
    }, [food, score, onGameOver]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full flex justify-between items-end mb-2 px-1">
                <div className="text-cyan-400 text-xl font-bold">
                    SCORE: <span className="text-magenta-400">{score.toString().padStart(4, '0')}</span>
                </div>
                <div className="text-xs text-gray-500 animate-pulse">
                    {isPaused ? 'SYSTEM_PAUSED' : 'SYSTEM_RUNNING'}
                </div>
            </div>

            <div 
                className="relative bg-dark border-4 border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                style={{
                    width: '400px',
                    height: '400px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                }}
            >
                {/* Grid Background (optional, for aesthetic) */}
                <div className="absolute inset-0 pointer-events-none opacity-10"
                     style={{
                         backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
                         backgroundSize: `${400/GRID_SIZE}px ${400/GRID_SIZE}px`
                     }}
                />

                {/* Food */}
                <div 
                    className="bg-magenta-500 shadow-[0_0_10px_#ff00ff] animate-pulse"
                    style={{
                        gridColumnStart: food.x + 1,
                        gridRowStart: food.y + 1,
                        margin: '1px'
                    }}
                />

                {/* Snake */}
                {snake.map((segment, index) => (
                    <div 
                        key={`${segment.x}-${segment.y}-${index}`}
                        className={`${index === 0 ? 'bg-cyan-400' : 'bg-cyan-600'} shadow-[0_0_5px_#00ffff]`}
                        style={{
                            gridColumnStart: segment.x + 1,
                            gridRowStart: segment.y + 1,
                            margin: '1px',
                            opacity: index === 0 ? 1 : 0.8 - (index * 0.02)
                        }}
                    />
                ))}

                {/* Overlays */}
                {isGameOver && (
                    <div className="absolute inset-0 bg-dark/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                        <h2 className="text-4xl text-magenta-500 glitch-text mb-4" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                        <p className="text-cyan-400 mb-6">FINAL_SCORE: {score}</p>
                        <button 
                            onClick={resetGame}
                            className="border-2 border-cyan-500 text-cyan-400 px-6 py-2 hover:bg-cyan-500 hover:text-dark transition-colors uppercase font-bold"
                        >
                            [ REBOOT_SYSTEM ]
                        </button>
                    </div>
                )}
                
                {isPaused && !isGameOver && (
                    <div className="absolute inset-0 bg-dark/50 flex items-center justify-center z-10">
                        <h2 className="text-3xl text-cyan-400 animate-blink">PAUSED</h2>
                    </div>
                )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
                USE [W,A,S,D] OR ARROWS TO MOVE. [P] TO PAUSE.
            </div>
        </div>
    );
};