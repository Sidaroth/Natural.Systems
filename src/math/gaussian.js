/**
 * Returns a gaussian random function with the given mean and stdev.
 * https://www.wikiwand.com/en/Marsaglia_polar_method
 * Consider implement ziggurat algorithm instead as it's faster.
 */
const gaussianGen = function gaussianGen(mean, stdev) {
    let hasSpare = false;
    let spare;

    return () => {
        if (hasSpare) {
            hasSpare = false;
            return mean + stdev * spare;
        } else {
            let num1;
            let num2;
            let mag;

            do {
                num1 = 2.0 * Math.random() - 1.0;
                num2 = 2.0 * Math.random() - 1.0;
                mag = num1 * num1 + num2 * num2;
            } while (mag >= 1.0 || mag === 0);

            mag = Math.sqrt((-2.0 * Math.log(mag)) / mag);
            spare = num2 * mag;
            hasSpare = true;

            const generated = num1 * mag;
            return mean + stdev * generated;
        }
    };
};

export default gaussianGen;
