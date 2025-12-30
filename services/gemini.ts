
import { GoogleGenAI } from "@google/genai";
import { SimulationResult, GameConfig } from "../types";

export const getAIAnalysis = async (result: SimulationResult, config: GameConfig) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a professional lottery analyst and statistician. 
    I have run 1,000,000 Monte Carlo simulations using a Markov Chain model for the "${config.name}" lottery.
    
    Game Rules: 
    - Main Pool: ${config.mainRange[0]}-${config.mainRange[1]} (Pick ${config.mainCount})
    ${config.specialRange ? `- Special Pool: ${config.specialRange[0]}-${config.specialRange[1]} (Pick ${config.specialCount})` : ''}

    Simulation Results:
    - Recommended Main Numbers: ${result.recommended.join(', ')}
    ${result.recommendedSpecial ? `- Recommended Special Numbers: ${result.recommendedSpecial.join(', ')}` : ''}
    - Total Trials: ${result.totalTrials.toLocaleString()}
    - Processing Time: ${result.timeTaken}ms

    Please provide:
    1. A statistical interpretation of these numbers (e.g., dispersion, odd/even ratio).
    2. A "Lucky Analysis" in a professional but encouraging tone.
    3. A brief summary of why Monte Carlo/Markov methods are useful for this kind of pattern finding.
    
    Keep the response concise and formatted in Markdown. Use Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "无法获取AI分析报告，请稍后再试。";
  }
};
