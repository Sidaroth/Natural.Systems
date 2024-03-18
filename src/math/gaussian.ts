/**
 * Returns a gaussian random function with the given mean and stdev. (Box-Muller transform)
 * https://www.wikiwand.com/en/Marsaglia_polar_method
 * Consider implement ziggurat algorithm instead as it's faster.
 */
function gaussianGen(mean: number, stdev: number) {
    // It generates two numbers at a time, so we store the second one for the next call.
    let hasSpare = false;
    let spare: number = 0;

    const generator = () => {
        // If we have a spare, use it.
        if (hasSpare) {
            hasSpare = false;
            return mean + (stdev * spare);
        }

        let firstNum;
        let secondNum;
        let magnitude;

        // Generate two numbers num1 and num2 within the unit circle.
        do {
            firstNum = (2.0 * Math.random()) - 1.0;
            secondNum = (2.0 * Math.random()) - 1.0;
            magnitude = (firstNum * firstNum) + (secondNum * secondNum);
        } while (magnitude >= 1.0 || magnitude === 0);

        // This forms a radius (mag) from a uniform (0, 1] to a random (0, 1] with a gaussian distribution.
        magnitude = Math.sqrt((-2.0 * Math.log(magnitude)) / magnitude);

        // Store one of the numbers for the next call (spare).
        spare = secondNum * magnitude;
        hasSpare = true;

        // Return a gaussian random number.
        const generated = firstNum * magnitude;
        return mean + (stdev * generated);
    };

    return generator;
}

export default gaussianGen;
