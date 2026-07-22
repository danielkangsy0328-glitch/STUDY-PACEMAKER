import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI Smart Planner Generation Endpoint
  app.post("/api/plan/generate", async (req, res) => {
    try {
      const { mainGoal, totalAvailableMinutes, fatigueLevel, startTimeStr = "16:00", isLongTermPlan = false, customSubjects } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY_MISSING",
          message: "API key is missing in environment. Fallback to rule engine."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
당신은 중학생을 위한 '1:1 맞춤형 공부 페이스메이커' AI 지도교사입니다.
다음 입력 정보와 [5가지 작성 규칙]에 맞춰 공부 타임라인 플래너를 JSON 형태로 생성하세요.

[사용자 입력]
- 오늘 할 공부 목표: ${mainGoal || "전과목 핵심 정복"}
- 사용 가능한 총 시간: ${totalAvailableMinutes || 180}분 (${Math.floor((totalAvailableMinutes || 180) / 60)}시간 ${(totalAvailableMinutes || 180) % 60}분)
- 현재 피로도: ${fatigueLevel}% (0: 최상, 100: 방전)
- 시작 시간: ${startTimeStr}
- 긴 시간 타임라인 여부 (6h~12h 확장): ${isLongTermPlan ? "예 (긴 시간 플랜)" : "아니오"}
- 과목 목록: ${customSubjects ? JSON.stringify(customSubjects) : "수학, 영어, 국어, 과학, 사회 중 선택"}

[필수 작성 규칙]
1. 사용자가 과목 목록(customSubjects)에서 입력한 공부 예상 시간(estimatedMinutes)과 휴식 시간(breakMinutes)이 있다면, 반드시 그 시간을 해당 공부/휴식 세션 시간으로 최우선 적용할 것.
2. 공부시간과 휴식시간은 매우 유동적이고 자유로울 수 있음 (예: 4시간 연속 공부 후 2시간 유동 휴식 등 사용자가 설정한 비율 및 일정을 완벽히 존중할 것).
3. 난이도가 높은 과목(HIGH difficulty)을 가급적 먼저 배치하되, 사용자가 직접 설정한 과목 순서와 시간 구성을 우선 반영할 것.
4. 말투는 동기부여를 주는 친근하고 긍정적이며 다정한 톤으로 응원 문구와 세션 설명을 작성할 것 (예: "너의 노력을 응원해! 할 수 있어! ✨").
5. 출력 형태는 시간대별 타임라인 형식(startTime, endTime, durationMinutes)으로 오차 없이 정교하게 계산할 것.

응답은 반드시 아래 JSON 스키마를 만족해야 합니다.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainGoal: { type: Type.STRING },
              encouragementMsg: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    difficulty: { type: Type.STRING, description: "HIGH, MEDIUM, or EASY" },
                    startTime: { type: Type.STRING, description: "e.g. 16:00" },
                    endTime: { type: Type.STRING, description: "e.g. 16:30" },
                    durationMinutes: { type: Type.NUMBER },
                    isBreak: { type: Type.BOOLEAN },
                    breakTip: { type: Type.STRING }
                  },
                  required: ["id", "subject", "title", "description", "difficulty", "startTime", "endTime", "durationMinutes", "isBreak"]
                }
              }
            },
            required: ["mainGoal", "encouragementMsg", "tasks"]
          }
        }
      });

      const planData = JSON.parse(response.text || "{}");
      return res.json({ success: true, plan: planData });
    } catch (err: any) {
      console.error("Gemini API plan generation error:", err);
      return res.status(500).json({ error: "AI_GENERATION_FAILED", message: err.message });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
