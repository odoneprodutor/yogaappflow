
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserPreferences, SessionRecord, TrainingPlan } from "../types";

// Initialize Gemini
// Ensure you have VITE_GEMINI_API_KEY in your .env.local
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

export interface CoachContext {
    userParams: UserPreferences;
    name: string;
    recentHistory: SessionRecord[];
    activePlan?: TrainingPlan | null;
}

export const aiCoachService = {
    async sendMessage(message: string, context: CoachContext, chatHistory: any[] = []): Promise<string> {
        if (!model) {
            return "A chave da API do Gemini não foi configurada. Verifique seu arquivo .env.local.";
        }

        try {
            // Construct System Prompt with User Context
            const systemPrompt = `
Você é o "YogaFlow Coach", um instrutor de yoga pessoal, empático, motivador e técnico.
Você está conversando com: ${context.name}.

CONTEXTO DO ALUNO:
- Nível: ${context.userParams.level} (Manual: ${context.userParams.manualLevel || 'N/A'})
- Objetivo Principal: ${context.userParams.goal}
- Duração Típica: ${context.userParams.duration} min
- Dores/Desconfortos: ${context.userParams.discomforts?.join(', ') || 'Nenhuma'}
- Taxa de Sucesso Recente: ${context.userParams.successRate || 0}%
- Plano Atual: ${context.activePlan?.name || 'Sem plano ativo'}

HISTÓRICO RECENTE:
${context.recentHistory.slice(0, 5).map(h => `- ${h.date}: ${h.routineName}`).join('\n')}

DIRETRIZES:
1. Seja curto e direto, mas caloroso (max 3-4 frases por resposta, salvo se pedido explicação detalhada).
2. Use emojis ocasionalmente para manter o tom leve 🧘‍♂️.
3. Se o aluno relatar dor, sugira adaptações ou descanso, nunca diagnóstico médico.
4. Motive com base no progresso ("Vejo que você praticou 3x essa semana!").
5. Responda em Português do Brasil.

PERGUNTA DO ALUNO: "${message}"
`;
            // For simple implementation, we generate content. 
            // For chat history, we could use startChat, but single-turn with context injection is often more robust for keeping persona.

            // Let's use simple generate for now, treating history as context if needed, but the prompt above resets context each time which is safer for state.
            // If we want chat history, we can append previous messages to the prompt.

            const result = await model.generateContent(systemPrompt);
            const response = result.response;
            return response.text();

        } catch (error) {
            console.error("Gemini Error:", error);
            return "Desculpe, estou tendo problemas para meditar sobre sua resposta agora. Tente novamente em instantes.";
        }
    }
};
