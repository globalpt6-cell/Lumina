
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { WritingFeedback, ReadingSimplification, VocabularyWord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async getWritingFeedback(text: string): Promise<WritingFeedback> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Proofread and improve this text for an adult learner. Fix spelling, grammar, and punctuation. 
      Provide a "professional", "friendly", and "extremely simple" version. 
      Also explain the major corrections made. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedText: { type: Type.STRING },
            explanations: { type: Type.ARRAY, items: { type: Type.STRING } },
            variations: {
              type: Type.OBJECT,
              properties: {
                professional: { type: Type.STRING },
                friendly: { type: Type.STRING },
                simple: { type: Type.STRING }
              },
              required: ["professional", "friendly", "simple"]
            }
          },
          required: ["correctedText", "explanations", "variations"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  async simplifyReading(text: string): Promise<ReadingSimplification> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this text and provide:
      1. A bulleted summary in simple language.
      2. A rewritten version that is much easier to read.
      3. A list of difficult words with simple definitions.
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.ARRAY, items: { type: Type.STRING } },
            simpleVersion: { type: Type.STRING },
            difficultWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  definition: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async getWordOfTheDay(): Promise<VocabularyWord> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a useful vocabulary word for an adult learner. Choose something practical for daily life or work.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async speakText(text: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this clearly and supportively: ${text}` }] }],
      config: {
        responseModalalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  },

  connectLiveReading(
    targetText: string, 
    callbacks: { 
      onTranscription: (text: string, isUser: boolean) => void;
      onError: (e: any) => void;
    }
  ) {
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: `You are a supportive literacy coach. The user is going to read this text out loud: "${targetText}".
        Listen to them. If they get stuck, offer help. Encourage them. Transcribe their speech accurately. 
        Your main goal is to help them identify words they find difficult.`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        }
      },
      callbacks: {
        onopen: () => console.log("Live session opened"),
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            callbacks.onTranscription(message.serverContent.inputTranscription.text, true);
          }
          if (message.serverContent?.outputTranscription) {
            callbacks.onTranscription(message.serverContent.outputTranscription.text, false);
          }
        },
        onerror: callbacks.onError,
        onclose: () => console.log("Live session closed"),
      }
    });
  }
};
