// Purpose: Interface for noisejs library.
// The noisejs library is a simple noise generation library that is used in the WindySnow and NoiseVisualizer modules.
// @types/noisejs does exist - but it doesn't list it correctly so we need to create our own.

declare module 'noisejs' {
    // eslint-disable-next-line import/prefer-default-export
    export class Noise {
        /**
         * Passing in seed will seed this Noise instance
         */
        constructor(seed?: number);

        /**
         * 2D simplex noise
         * @return noise value
         */
        simplex2(x: number, y: number): number;

        /**
         * 3D simplex noise
         * @return noise value
         */
        simplex3(x: number, y: number, z: number): number;

        /**
         * 2D Perlin Noise
         * @return noise value
         */
        perlin2(x: number, y: number): number;

        /**
         * 3D Perlin Noise
         * @return noise value
         */
        perlin3(x: number, y: number, z: number): number;

        /**
         * This isn't a very good seeding function, but it works ok. It supports 2^16
         * different seed values. Write something better if you need more seeds.
         */
        seed(seed: number): void;
    }
}
