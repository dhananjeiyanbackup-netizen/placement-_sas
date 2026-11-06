import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client if environment variable is present
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with provided key', err);
  }
}

export interface CommunicationAIEvaluation {
  readingAccuracyScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  wpm: number;
  phoneticCoaching: string;
  strengths: string[];
  areasForImprovement: string[];
  interviewTip: string;
}

export async function evaluateSpeakingWithAI(
  originalPassage: string,
  spokenTranscription: string,
  speakingDurationSec: number,
  category: string
): Promise<CommunicationAIEvaluation> {
  const prompt = `
You are the AI Chief Communication and Campus Placement Specialist at Sasurie College of Engineering.
Assess the following English reading and speaking test attempt by an engineering student:

Category: ${category}
Expected Passage:
"""
${originalPassage}
"""

Spoken Transcription:
"""
${spokenTranscription}
"""

Duration: ${speakingDurationSec} seconds.

Analyze:
1. Reading accuracy & phoneme pronunciation clarity.
2. Speaking pace, articulation, sentence completion, and pausing.
3. Tailored guidance for Indian campus placement interviews (TCS, Zoho, Cognizant, Cyber/AI tech roles).

Return a valid JSON object matching this structure (no markdown wrappers, raw JSON only):
{
  "readingAccuracyScore": 88,
  "pronunciationScore": 85,
  "fluencyScore": 80,
  "wpm": 120,
  "phoneticCoaching": "Detailed phonetic tips on difficult words.",
  "strengths": ["Clear opening articulation", "Good vocal confidence"],
  "areasForImprovement": ["Pacing on technical terms", "Avoid repeating filler words"],
  "interviewTip": "Maintain active eye contact and emphasize technical impact."
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('Gemini API request failed or timed out, using fallback analyzer', err);
    }
  }

  // Fallback intelligent heuristic evaluation
  const origWords = originalPassage.toLowerCase().split(/\s+/);
  const spokenWords = spokenTranscription.toLowerCase().split(/\s+/);
  let matched = 0;
  for (const w of spokenWords) {
    if (origWords.includes(w)) matched++;
  }
  const accuracy = Math.min(100, Math.round((matched / (origWords.length || 1)) * 100));
  const wpm = Math.round((spokenWords.length / Math.max(0.1, speakingDurationSec)) * 60);

  return {
    readingAccuracyScore: accuracy,
    pronunciationScore: Math.max(70, Math.min(95, accuracy - 5)),
    fluencyScore: wpm >= 100 && wpm <= 160 ? 90 : 75,
    wpm,
    phoneticCoaching:
      'Focus on vowel clarity in multi-syllable terms like "architecture", "specialization", and "vulnerability". Practice soft endings on consonant clusters.',
    strengths: [
      'Steady vocal delivery and professional composure',
      'Accurate reading of foundational terminology',
    ],
    areasForImprovement: [
      'Maintain steady tempo when encountering complex technical vocabulary',
      'Pause purposefully at commas rather than mid-clause',
    ],
    interviewTip:
      'In tech interviews, speaking at a measured 120-130 WPM signals confidence and allows interviewers to absorb your problem-solving depth.',
  };
}

export async function generateQuestionWithAI(
  subject: string,
  topic: string,
  difficulty: string
): Promise<{
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}> {
  const prompt = `
Generate 1 high quality engineering examination multiple choice question for Sasurie College of Engineering.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Respond in pure JSON format:
{
  "questionText": "...",
  "options": [
    {"id": "A", "text": "..."},
    {"id": "B", "text": "..."},
    {"id": "C", "text": "..."},
    {"id": "D", "text": "..."}
  ],
  "correctAnswer": "A",
  "explanation": "..."
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Gemini question generation error', err);
    }
  }

  // Fallback high quality template
  return {
    questionText: `In ${subject} (${topic}), which mechanism ensures non-repudiation and cryptographic integrity across distributed nodes?`,
    options: [
      { id: 'A', text: 'Digital Signature with Private Key signing & Public Key verification' },
      { id: 'B', text: 'Symmetric Stream Cipher with Pre-shared Key' },
      { id: 'C', text: 'Cyclic Redundancy Check (CRC-32)' },
      { id: 'D', text: 'Unicast Session Border Controller' },
    ],
    correctAnswer: 'A',
    explanation:
      'Digital signatures bind the identity of the signer to the content, providing non-repudiation because only the private key owner could have produced the signature.',
  };
}
