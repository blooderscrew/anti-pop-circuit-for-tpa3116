import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamCircuitExplanation = async (
  userQuestion: string,
  circuitContext: string,
  onChunk: (text: string) => void
) => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      You are an expert electronics teacher helping a beginner understand an anti-pop circuit for an audio amplifier.
      
      The Circuit Context:
      - Power Supply: 24V.
      - Chip: TPA3116 (Amplifier).
      - Goal: Prevent "pop" sounds by keeping the amp muted (SDZ pin low) for ~1 second at startup, and muting instantly at power off.
      - Components: 
        - 10uF Capacitor (Timer)
        - BC548 NPN Transistor (Switch to pull SDZ low)
        - 22k Resistor (Base resistor)
        - 100k Resistor (Discharge path)
        - 12k Resistor (Voltage divider for SDZ)
      
      Current State of Simulation: ${circuitContext}

      Answer the user's question simply, using analogies (like water flow) where possible. Keep it concise.
    `;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessageStream({ message: userQuestion });

    for await (const chunk of result) {
        if (chunk.text) {
            onChunk(chunk.text);
        }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("Sorry, I'm having trouble connecting to the electronics lab right now. Please check your API key.");
  }
};