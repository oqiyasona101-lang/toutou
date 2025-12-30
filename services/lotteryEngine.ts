
import { GameConfig } from '../types';

/**
 * Markov Monte Carlo Simulation Engine
 * Runs 1M iterations to find statistically "favored" outcomes based on a transition-probability model.
 */
export class LotteryEngine {
  private config: GameConfig;
  private iterations: number = 1000000;
  private chunkSize: number = 50000;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * Generates a single set of numbers using a simple Markov model where 
   * the probability of picking a number depends slightly on the previous number 
   * (simulating local clustering/dispersion tendencies).
   */
  private generateMarkovSet(range: [number, number], count: number): number[] {
    const [min, max] = range;
    const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const result: number[] = [];
    
    // Initial number picked uniformly
    let current = pool[Math.floor(Math.random() * pool.length)];
    result.push(current);

    while (result.length < count) {
      // Markov transition logic:
      // We simulate a tendency for numbers not to be immediate neighbors too often, 
      // but also stay within certain "waves".
      const weights = pool.map(num => {
        if (result.includes(num)) return 0;
        const diff = Math.abs(num - current);
        // Probability peak at a distance of 3-7 (common dispersion)
        if (diff >= 3 && diff <= 12) return 5;
        if (diff === 1 || diff === 2) return 1; // Adjacent numbers less likely but possible
        return 2; // Default
      });

      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalWeight;
      let nextIdx = 0;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          nextIdx = i;
          break;
        }
      }
      
      current = pool[nextIdx];
      result.push(current);
    }

    return result.sort((a, b) => a - b);
  }

  /**
   * Run Monte Carlo Simulation across 1,000,000 trials
   */
  async runSimulation(onProgress: (progress: number) => void) {
    const startTime = Date.now();
    const mainFreq: Record<number, number> = {};
    const specFreq: Record<number, number> = {};

    for (let i = 0; i <= this.iterations; i += this.chunkSize) {
      // Chunk processing to keep UI thread alive
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const currentBatchSize = Math.min(this.chunkSize, this.iterations - i);
      
      for (let j = 0; j < currentBatchSize; j++) {
        // Main numbers
        const mainSet = this.generateMarkovSet(this.config.mainRange, this.config.mainCount);
        mainSet.forEach(num => {
          mainFreq[num] = (mainFreq[num] || 0) + 1;
        });

        // Special numbers
        if (this.config.specialRange && this.config.specialCount) {
          const specSet = this.generateMarkovSet(this.config.specialRange, this.config.specialCount);
          specSet.forEach(num => {
            specFreq[num] = (specFreq[num] || 0) + 1;
          });
        }
      }

      onProgress(Math.min(100, (i / this.iterations) * 100));
    }

    // Recommendation logic: Pick top N frequent numbers from the 1M simulations
    const getTopN = (freq: Record<number, number>, n: number) => {
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(entry => parseInt(entry[0]))
        .sort((a, b) => a - b);
    };

    const recommended = getTopN(mainFreq, this.config.mainCount);
    const recommendedSpecial = this.config.specialCount 
      ? getTopN(specFreq, this.config.specialCount) 
      : undefined;

    return {
      frequencies: mainFreq,
      specialFrequencies: specFreq,
      recommended,
      recommendedSpecial,
      totalTrials: this.iterations,
      timeTaken: Date.now() - startTime
    };
  }
}
