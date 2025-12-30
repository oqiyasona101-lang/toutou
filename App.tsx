
import React, { useState, useCallback, useEffect } from 'react';
import { GAME_CONFIGS, SimulationResult, GameConfig } from './types';
import { LotteryEngine } from './services/lotteryEngine';
import { getAIAnalysis } from './services/gemini';
import NumberBall from './components/NumberBall';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameConfig>(GAME_CONFIGS.ssq);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const runSim = async () => {
    setIsSimulating(true);
    setProgress(0);
    setResult(null);
    setAiReport(null);

    const engine = new LotteryEngine(selectedGame);
    const simResult = await engine.runSimulation((p) => setProgress(p));
    
    setResult(simResult);
    setIsSimulating(false);

    // Fetch AI Analysis automatically
    setLoadingAi(true);
    const report = await getAIAnalysis(simResult, selectedGame);
    setAiReport(report);
    setLoadingAi(false);
  };

  const chartData = result ? Object.entries(result.frequencies).map(([num, freq]) => ({
    number: parseInt(num),
    frequency: freq
  })).sort((a, b) => a.number - b.number) : [];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="py-8 px-4 text-center glass border-b border-white/5 mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Gemini Lottery Oracle
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          基于 1,000,000 次蒙特卡洛模拟与马尔可夫链模型的高级彩票趋势分析系统
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-gamepad text-blue-400"></i>
              选择玩法
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(GAME_CONFIGS).map((config) => (
                <button
                  key={config.name}
                  onClick={() => !isSimulating && setSelectedGame(config)}
                  disabled={isSimulating}
                  className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                    selectedGame.name === config.name 
                      ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold">{config.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {config.mainCount}个主号 + {config.specialCount || 0}个特别号
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={runSim}
              disabled={isSimulating}
              className={`w-full mt-8 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isSimulating 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  模拟中 {Math.round(progress)}%
                </>
              ) : (
                <>
                  <i className="fas fa-microchip"></i>
                  开始模拟计算
                </>
              )}
            </button>
          </div>

          {/* Logic Explanation */}
          <div className="glass p-6 rounded-2xl bg-indigo-900/10">
            <h3 className="font-semibold text-blue-300 mb-2">模型原理说明</h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li><strong>马尔可夫链：</strong>模拟号码间的“转移概率”，捕捉号码聚集或分散的内在规律。</li>
              <li><strong>蒙特卡洛：</strong>通过 1,000,000 次随机抽样实验，获取统计学上的显著高频组合。</li>
              <li><strong>Gemini 3：</strong>由谷歌最强 AI 提供基于统计数据的深度趋势解读。</li>
            </ul>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Progress Bar (Global) */}
          {isSimulating && (
            <div className="glass p-8 rounded-2xl text-center animate-pulse">
              <div className="text-2xl font-bold mb-4">正在进行 1,000,000 次模拟...</div>
              <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-slate-400 text-sm italic">计算量巨大，正在榨取浏览器算力</p>
            </div>
          )}

          {!isSimulating && result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Recommendation Card */}
              <div className="glass p-8 rounded-2xl neon-border">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">推荐号码组</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      基于频率最高的模拟结果 (样本数: 1,000,000)
                    </p>
                  </div>
                  <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-mono">
                    Time: {result.timeTaken}ms
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-center py-6 bg-white/5 rounded-xl">
                  {result.recommended.map((num) => (
                    <NumberBall key={`main-${num}`} number={num} type={selectedGame.type === '快乐八' ? 'gold' : 'red'} size="lg" />
                  ))}
                  {result.recommendedSpecial && result.recommendedSpecial.map((num) => (
                    <NumberBall key={`spec-${num}`} number={num} type="blue" size="lg" />
                  ))}
                </div>
              </div>

              {/* Statistics Chart */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <i className="fas fa-chart-bar text-purple-400"></i>
                  号码分布热度 (1M 次模拟)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="number" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={result.recommended.includes(entry.number) ? '#3b82f6' : '#475569'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Report */}
              <div className="glass p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <i className="fas fa-robot text-8xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-300">
                  <i className="fas fa-brain"></i>
                  Gemini AI 分析报告
                </h3>
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 animate-pulse-slow">正在调用 Gemini 3 进行智能推演...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {aiReport || "点击“开始模拟”以生成分析报告。"}
                  </div>
                )}
              </div>
            </div>
          )}

          {!result && !isSimulating && (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 glass rounded-2xl border-dashed border-2 border-white/10">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-dice text-4xl text-blue-500 animate-bounce"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">等待开始</h2>
              <p className="text-slate-400 max-w-sm">
                点击左侧按钮，我们将通过复杂的马尔可夫链蒙特卡洛模型为您生成 1,000,000 组数据并进行深度分析。
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Warning Footer */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 p-4 text-center z-50">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
          ⚠️ 理性购彩 · 切勿沉迷 · 本程序基于数学模型模拟，结果仅供娱乐参考，不构成任何投注建议
        </p>
      </footer>
    </div>
  );
};

export default App;
