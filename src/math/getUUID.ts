/* eslint-disable no-bitwise */

// https://datatracker.ietf.org/doc/html/rfc4122#section-4.4
function getUUID(): string {
    // Base v4 UUID - note the 4 in the 3rd section is fixed as per the RFC
    const baseValue = '10000000-1000-4000-8000-100000000000';
    const pattern = /[018]/g;

    // Replaces all occurrences of 0, 1, and 8 (x's) with a random value
    // resulting in xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // The replacer is ran for each matching character "x" in the string
    const replacer = (char: string) => {
        // Generate a random value from 0 to 255
        const randomNumber = crypto.getRandomValues(new Uint8Array(1))[0] as number;

        const charNum: number = Number(char);

        // Shift 15 (1111 binary) to the right by the character divided by 4 places.
        // As char can only be 0, 1 or 8 - the results will be 15, 15, and 3 respectively.
        // IF char is 0, then 15 >> (0 / 4) = 15 -> 15 >> Int(0) = 1111 = 15
        // IF char is 1, then 15 >> (1 / 4) = 7 -> 15 >> Int(0.25) = 1111 = 15
        // IF char is 8, then 15 >> (8 / 4) = 0 -> 15 >> Int(2) = 0011 = 3
        const shiftedValue = 15 >> (charNum / 4);

        // Mask the random number with the shifted value using the bitwise AND operator
        // e.g.10101010 -> 170 decimal
        // 10101010 & 00001111 = 00001010
        // 10101010 & 00000011 = 00000010
        // This effectively truncates the [0, 255] range to a 4 bit number - [0, 15] or [0, 3]
        const andResult = randomNumber & shiftedValue;

        // XOR the character (0, 1 or 8) with masked value (0-15 or 0-3) to get the final value
        // Operates on the binary representation of the values (e.g. 1010 ^ 1100 = 0110)
        // This helps to randomize the character while preserving its format as specified by RFC 4122.
        const xorResult = (charNum ^ andResult);

        // Returns the hexadecimal representation of the value
        return xorResult.toString(16);
    };

    return baseValue.replace(pattern, replacer);
}
/* eslint-enable no-bitwise */

export default getUUID;
