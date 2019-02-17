export class MathUtils {

  /**
   * Provides a sigmoid function in terms of the provided max, growth, and midpoint
   * @param max
   * @param growth
   * @param midpoint
   */
  public static getSigmoid(max: number, growth: number, midpoint: number): ((x: number) => number) {
    return (x: number) => {
      return max / (1 + Math.exp(-growth * (x - midpoint)));
    };
  }

}
