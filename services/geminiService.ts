
import { GoogleGenAI } from "@google/genai";
import { TrainingCenter } from "../types";

export const getGeminiInsights = async (centers: TrainingCenter[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const dataSummary = centers.map(c => 
    `${c.name}: 상태=${c.status}, 연평균 가동률=${c.occupancyRate}%, 수용인원=${c.capacity}명`
  ).join('\n');

  const prompt = `
    당신은 사회공헌 및 공공시설 운영 전문 AI 분석가입니다. 
    사용자는 13개의 교육장을 "무료"로 임대해주고 있습니다.
    
    데이터 요약:
    ${dataSummary}

    이 데이터를 바탕으로 다음 내용을 분석해 주세요:
    1. 현재 공간 활용 효율성 평가 (무료 임대인 만큼 가동률 극대화가 중요합니다)
    2. 더 많은 교육생이 혜택을 받을 수 있도록 하는 운영 최적화 방안
    3. 시설 노후화 방지 및 유지보수 리스크 제안
    
    답변은 한국어로, 무료 교육 공간 제공이라는 사회적 가치를 실현하는 운영자에게 힘이 되는 따뜻하면서도 분석적인 비즈니스 톤으로 작성하세요.
    마크다운 형식을 사용하여 가독성 있게 전달하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 분석 데이터를 불러오는 중 오류가 발생했습니다.";
  }
};
