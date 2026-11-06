import { Question } from '../types';

export interface ScoreCalculationResult {
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  passed: boolean;
}

export function calculateExamScore(
  answers: Record<string, string>,
  questions: Question[],
  negativeMarking: boolean = false,
  negativeMarkValue: number = 0.25,
  passingMarks: number = 50
): ScoreCalculationResult {
  let marksObtained = 0;
  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const q of questions) {
    totalMarks += q.marks;
    const studentAnswer = (answers[q.id] || '').trim();

    if (!studentAnswer) {
      unansweredCount++;
      continue;
    }

    const isCorrect = isAnswerCorrect(studentAnswer, q.correctAnswer, q.type);

    if (isCorrect) {
      correctCount++;
      marksObtained += q.marks;
    } else {
      incorrectCount++;
      if (negativeMarking) {
        marksObtained = Math.max(0, marksObtained - negativeMarkValue);
      }
    }
  }

  // Round marks to 2 decimal places
  marksObtained = Math.round(marksObtained * 100) / 100;
  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 1000) / 10 : 0;
  const passed = marksObtained >= passingMarks;

  return {
    marksObtained,
    totalMarks,
    percentage,
    correctAnswersCount: correctCount,
    incorrectAnswersCount: incorrectCount,
    unansweredCount,
    passed,
  };
}

export function isAnswerCorrect(studentAnswer: string, correctAnswer: string, questionType: string): boolean {
  const normStudent = studentAnswer.trim().toLowerCase();
  const normCorrect = correctAnswer.trim().toLowerCase();

  if (questionType === 'mcq' || questionType === 'true_false') {
    return normStudent === normCorrect;
  }

  if (questionType === 'short_answer') {
    // Exact or contains keywords
    if (normStudent === normCorrect) return true;
    const keywords = normCorrect.split(',').map((k) => k.trim());
    return keywords.some((kw) => kw && normStudent.includes(kw));
  }

  // Descriptive default match check
  return normStudent.length > 20;
}

export interface RankedResult {
  id: string;
  marksObtained: number;
  timeTakenMinutes: number;
  rank?: number;
}

export function calculateStudentRankings<T extends RankedResult>(results: T[]): (T & { rank: number })[] {
  const sorted = [...results].sort((a, b) => {
    if (b.marksObtained !== a.marksObtained) {
      return b.marksObtained - a.marksObtained;
    }
    return a.timeTakenMinutes - b.timeTakenMinutes;
  });

  return sorted.map((res, index) => ({
    ...res,
    rank: index + 1,
  }));
}
