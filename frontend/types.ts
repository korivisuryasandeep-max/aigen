export type Point = {
    x: number;
    y: number;
};

export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

export type Track = {
    id: string;
    name: string;
    tempo: number;
    type: 'cyber' | 'neon' | 'static';
};