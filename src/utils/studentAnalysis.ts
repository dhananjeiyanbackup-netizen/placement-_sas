import { Question, TopicDeficiency } from '../types';
import { isAnswerCorrect } from './examScoring';

export interface StudentWeaknessReport {
  studentId: string;
  studentName: string;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  masteredTopics: TopicDeficiency[];
  moderateTopics: TopicDeficiency[];
  criticalWeaknesses: TopicDeficiency[];
  priorityImprovementAdvice: string[];
}

export function analyzeStudentAreaDeficiencies(
  answers: Record<string, string>,
  questions: Question[],
  studentId: string,
  studentName: string
): StudentWeaknessReport {
  const topicStats = new Map<
    string,
    { subject: string; unit: number; correct: number; total: number; marks: number; earned: number }
  >();

  for (const q of questions) {
    const key = `${q.subject} - Unit ${q.unit}: ${q.topic}`;
    const current = topicStats.get(key) || {
      subject: q.subject,
      unit: q.unit,
      correct: 0,
      total: 0,
      marks: 0,
      earned: 0,
    };

    current.total += 1;
    current.marks += q.marks;

    const studentAns = (answers[q.id] || '').trim();
    if (studentAns && isAnswerCorrect(studentAns, q.correctAnswer, q.type)) {
      current.correct += 1;
      current.earned += q.marks;
    }

    topicStats.set(key, current);
  }

  const masteredTopics: TopicDeficiency[] = [];
  const moderateTopics: TopicDeficiency[] = [];
  const criticalWeaknesses: TopicDeficiency[] = [];

  for (const [key, stat] of topicStats.entries()) {
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    const topicName = key.split(': ')[1] || key;

    let status: 'mastered' | 'moderate' | 'needs_improvement' = 'moderate';
    let remedialAction = '';

    if (pct >= 80) {
      status = 'mastered';
      remedialAction = 'Excellent concept retention. Proceed to advanced gate/competitive problem sets.';
      masteredTopics.push({
        topic: topicName,
        subject: stat.subject,
        unit: stat.unit,
        score: stat.correct,
        total: stat.total,
        percentage: pct,
        status,
        remedialAction,
      });
    } else if (pct >= 50) {
      status = 'moderate';
      remedialAction = `Revise Unit ${stat.unit} core definitions and practice 10 objective MCQs.`;
      moderateTopics.push({
        topic: topicName,
        subject: stat.subject,
        unit: stat.unit,
        score: stat.correct,
        total: stat.total,
        percentage: pct,
        status,
        remedialAction,
      });
    } else {
      status = 'needs_improvement';
      remedialAction = `Urgent focus needed: Consult Unit ${stat.unit} lecture notes on "${topicName}" and attend faculty remedial clinic.`;
      criticalWeaknesses.push({
        topic: topicName,
        subject: stat.subject,
        unit: stat.unit,
        score: stat.correct,
        total: stat.total,
        percentage: pct,
        status,
        remedialAction,
      });
    }
  }

  const priorityImprovementAdvice: string[] = [];
  if (criticalWeaknesses.length > 0) {
    priorityImprovementAdvice.push(
      `Primary deficit identified in ${criticalWeaknesses.length} topic(s): ${criticalWeaknesses
        .map((w) => w.topic)
        .join(', ')}. Schedule immediate review.`
    );
  } else {
    priorityImprovementAdvice.push('No critical deficiencies identified across evaluated subjects.');
  }

  if (moderateTopics.length > 0) {
    priorityImprovementAdvice.push(
      `Strengthen consistency in: ${moderateTopics.map((m) => m.topic).join(', ')}.`
    );
  }

  const totalAnswered = Object.keys(answers).length;
  const overallAccuracy =
    questions.length > 0
      ? Math.round(
          (masteredTopics.reduce((a, b) => a + b.score, 0) +
            moderateTopics.reduce((a, b) => a + b.score, 0) +
            criticalWeaknesses.reduce((a, b) => a + b.score, 0)) /
            questions.length *
            100
        )
      : 85;

  return {
    studentId,
    studentName,
    totalQuestionsAttempted: totalAnswered,
    overallAccuracy,
    masteredTopics,
    moderateTopics,
    criticalWeaknesses,
    priorityImprovementAdvice,
  };
}
