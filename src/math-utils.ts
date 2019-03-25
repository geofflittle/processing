/**
 * Provides a sigmoid function in terms of the provided max, growth, and midpoint
 * @param max
 * @param growth
 * @param midpoint
 */
export const getSigmoid = (max: number, growth: number, midpoint: number): ((x: number) => number) => (x: number) =>
    (max / (1 + Math.exp(-growth * (x - midpoint))));

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export const map = (value: number, domainMin: number, domainMax: number, rangeMin: number, rangeMax: number): number =>
    (rangeMin + ((rangeMax - rangeMin) / (domainMax - domainMin)) * (value - domainMin));