/**
 * Returns a gaussian random function with the given mean and stdev. (Box-Muller transform)
 * https://www.wikiwand.com/en/Marsaglia_polar_method
 * Consider implement ziggurat algorithm instead as it's faster.
 */
const gaussianGen = function gaussianGen(mean, stdev) {
    // It generates two numbers at a time, so we store the second one for the next call.
    let hasSpare = false;
    let spare;

    return () => {
        // If we have a spare, use it.
        if (hasSpare) {
            hasSpare = false;
            return mean + (stdev * spare);
        }

        let num1;
        let num2;
        let mag;

        // Generate two numbers num1 and num2 within the unit circle.
        do {
            num1 = (2.0 * Math.random()) - 1.0;
            num2 = (2.0 * Math.random()) - 1.0;
            mag = (num1 * num1) + (num2 * num2);
        } while (mag >= 1.0 || mag === 0);

        // This forms a radius (mag) from a uniform (0, 1] to a random (0, 1] with a gaussian distribution.
        mag = Math.sqrt((-2.0 * Math.log(mag)) / mag);

        // Store one of the numbers for the next call (spare).
        spare = num2 * mag;
        hasSpare = true;

        // Return a gaussian random number.
        const generated = num1 * mag;
        return mean + (stdev * generated);
    };
};

export default gaussianGen;
