import { AssessmentRating } from '../types';

export interface SpeechAnalysisResult {
  readingAccuracy: number; // 0 - 100
  pronunciationScore: number; // 0 - 100
  fluencyScore: number; // 0 - 100
  speakingPaceWpm: number;
  missingWords: string[];
  incorrectWords: { expected: string; spoken: string }[];
  repeatedWords: string[];
  sentenceCompletionRate: number; // 0 - 100
  overallRating: AssessmentRating;
  wordStatuses: { word: string; status: 'correct' | 'incorrect' | 'missing' }[];
}

export function cleanWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .trim();
}

export function compareSpeechWithPassage(
  originalPassage: string,
  spokenText: string,
  durationSeconds: number = 30
): SpeechAnalysisResult {
  const origWordsRaw = originalPassage.split(/\s+/).filter(Boolean);
  const origWordsClean = origWordsRaw.map(cleanWord);

  const spokenWordsRaw = spokenText.split(/\s+/).filter(Boolean);
  const spokenWordsClean = spokenWordsRaw.map(cleanWord);

  const missingWords: string[] = [];
  const incorrectWords: { expected: string; spoken: string }[] = [];
  const repeatedWordsMap = new Map<string, number>();

  for (const w of spokenWordsClean) {
    repeatedWordsMap.set(w, (repeatedWordsMap.get(w) || 0) + 1);
  }
  const repeatedWords: string[] = [];
  for (const [w, count] of repeatedWordsMap.entries()) {
    if (count > 2 && !['the', 'a', 'an', 'and', 'in', 'of', 'to', 'is'].includes(w)) {
      repeatedWords.push(w);
    }
  }

  const wordStatuses: { word: string; status: 'correct' | 'incorrect' | 'missing' }[] = [];
  let correctMatches = 0;

  // Align word by word
  let spokenIndex = 0;
  for (let i = 0; i < origWordsClean.length; i++) {
    const expected = origWordsClean[i];
    const originalDisplay = origWordsRaw[i];

    if (spokenIndex >= spokenWordsClean.length) {
      // Remaining are missing
      missingWords.push(originalDisplay);
      wordStatuses.push({ word: originalDisplay, status: 'missing' });
      continue;
    }

    const spoken = spokenWordsClean[spokenIndex];

    if (spoken === expected) {
      correctMatches++;
      wordStatuses.push({ word: originalDisplay, status: 'correct' });
      spokenIndex++;
    } else {
      // Check if word appears nearby in spoken
      const lookahead = spokenWordsClean.slice(spokenIndex, spokenIndex + 3).indexOf(expected);
      if (lookahead !== -1) {
        // Skipped/added words
        spokenIndex += lookahead + 1;
        correctMatches++;
        wordStatuses.push({ word: originalDisplay, status: 'correct' });
      } else {
        // Pronounced incorrectly or substituted
        incorrectWords.push({ expected: originalDisplay, spoken: spokenWordsRaw[spokenIndex] || '' });
        wordStatuses.push({ word: originalDisplay, status: 'incorrect' });
        spokenIndex++;
      }
    }
  }

  const totalWords = origWordsClean.length || 1;
  const readingAccuracy = Math.min(100, Math.round((correctMatches / totalWords) * 100));

  // Speaking Pace: Words Per Minute (WPM)
  const durationMinutes = Math.max(0.1, durationSeconds / 60);
  const speakingPaceWpm = Math.round(spokenWordsClean.length / durationMinutes);

  // Fluency score based on pace balance (normal reading is ~110 - 150 WPM)
  let fluencyPenalty = 0;
  if (speakingPaceWpm < 90) fluencyPenalty += 15;
  if (speakingPaceWpm > 180) fluencyPenalty += 15;
  if (repeatedWords.length > 0) fluencyPenalty += Math.min(20, repeatedWords.length * 5);
  const fluencyScore = Math.max(30, Math.min(100, readingAccuracy - fluencyPenalty + 5));

  // Pronunciation score estimation
  const pronunciationDeduction = (incorrectWords.length / totalWords) * 60;
  const pronunciationScore = Math.max(25, Math.min(100, Math.round(100 - pronunciationDeduction)));

  const sentenceCompletionRate = Math.min(
    100,
    Math.round(((totalWords - missingWords.length) / totalWords) * 100)
  );

  // Overall rating determination
  const compositeScore = readingAccuracy * 0.4 + pronunciationScore * 0.35 + fluencyScore * 0.25;
  let overallRating: AssessmentRating = 'NEEDS IMPROVEMENT';
  if (compositeScore >= 80 && readingAccuracy >= 78) {
    overallRating = 'EXCELLENT';
  } else if (compositeScore >= 60) {
    overallRating = 'GOOD';
  }

  return {
    readingAccuracy,
    pronunciationScore,
    fluencyScore,
    speakingPaceWpm,
    missingWords,
    incorrectWords,
    repeatedWords,
    sentenceCompletionRate,
    overallRating,
    wordStatuses,
  };
}
