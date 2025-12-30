
export enum LotteryType {
  SSQ = 'Double Color Ball (双色球)',
  DLT = 'Super Lotto (大乐透)',
  K8 = 'Happy 8 (快乐八)'
}

export interface SimulationResult {
  frequencies: Record<number, number>;
  specialFrequencies: Record<number, number>;
  recommended: number[];
  recommendedSpecial?: number[];
  totalTrials: number;
  timeTaken: number;
}

export interface GameConfig {
  name: string;
  type: LotteryType;
  mainRange: [number, number];
  mainCount: number;
  specialRange?: [number, number];
  specialCount?: number;
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  ssq: {
    name: "双色球",
    type: LotteryType.SSQ,
    mainRange: [1, 33],
    mainCount: 6,
    specialRange: [1, 16],
    specialCount: 1
  },
  dlt: {
    name: "大乐透",
    type: LotteryType.DLT,
    mainRange: [1, 35],
    mainCount: 5,
    specialRange: [1, 12],
    specialCount: 2
  },
  k8: {
    name: "快乐八",
    type: LotteryType.K8,
    mainRange: [1, 80],
    mainCount: 20
  }
};
