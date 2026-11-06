import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateExamScore, calculateStudentRankings } from './examScoring';
import { compareSpeechWithPassage, cleanWord } from './speechDiff';
import { evaluateProctoringViolation } from './proctoringEngine';
import { Question } from '../types';

test('calculateExamScore calculates correct marks without negative marking', () => {
  const dummyQuestions: Question[] = [
    {
      id: 'q1',
      subject: 'Cyber Security',
      unit: 1,
      topic: 'Cryptography',
      type: 'mcq',
      questionText: 'What is RSA?',
      correctAnswer: 'A',
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      explanation: 'RSA is asymmetric algorithm',
      createdAt: '2026-01-01',
    },
    {
      id: 'q2',
      subject: 'Cyber Security',
      unit: 1,
      topic: 'Hashing',
      type: 'true_false',
      questionText: 'Is SHA-256 reversible?',
      correctAnswer: 'False',
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'easy',
      explanation: 'Hashes are one-way',
      createdAt: '2026-01-01',
    },
  ];

  const answers = { q1: 'A', q2: 'False' };
  const res = calculateExamScore(answers, dummyQuestions, false, 0, 2);
  assert.equal(res.marksObtained, 3);
  assert.equal(res.totalMarks, 3);
  assert.equal(res.percentage, 100);
  assert.equal(res.correctAnswersCount, 2);
  assert.equal(res.passed, true);
});

test('calculateExamScore handles negative marking and incorrect answers', () => {
  const dummyQuestions: Question[] = [
    {
      id: 'q1',
      subject: 'AI',
      unit: 1,
      topic: 'Intro',
      type: 'mcq',
      questionText: 'Sample Q',
      correctAnswer: 'B',
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      explanation: '',
      createdAt: '2026-01-01',
    },
    {
      id: 'q2',
      subject: 'AI',
      unit: 1,
      topic: 'Intro',
      type: 'mcq',
      questionText: 'Sample Q2',
      correctAnswer: 'C',
      marks: 2,
      negativeMarks: 0.5,
      difficulty: 'medium',
      explanation: '',
      createdAt: '2026-01-01',
    },
  ];

  const answers = { q1: 'B', q2: 'A' }; // 1 correct (2 marks), 1 incorrect (-0.5 marks) = 1.5 marks
  const res = calculateExamScore(answers, dummyQuestions, true, 0.5, 3);
  assert.equal(res.marksObtained, 1.5);
  assert.equal(res.correctAnswersCount, 1);
  assert.equal(res.incorrectAnswersCount, 1);
  assert.equal(res.passed, false);
});

test('calculateStudentRankings assigns correct ranks based on marks and time', () => {
  const results = [
    { id: 'res1', marksObtained: 85, timeTakenMinutes: 45 },
    { id: 'res2', marksObtained: 95, timeTakenMinutes: 50 },
    { id: 'res3', marksObtained: 85, timeTakenMinutes: 30 },
  ];
  const ranked = calculateStudentRankings(results);
  assert.equal(ranked[0].id, 'res2'); // 95 marks -> Rank 1
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].id, 'res3'); // 85 marks in 30 mins -> Rank 2
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[2].id, 'res1'); // 85 marks in 45 mins -> Rank 3
  assert.equal(ranked[2].rank, 3);
});

test('cleanWord cleans punctuation and lowercases', () => {
  assert.equal(cleanWord('Artificial!'), 'artificial');
  assert.equal(cleanWord('"Cybersecurity,"'), 'cybersecurity');
});

test('compareSpeechWithPassage scores matching text with high accuracy', () => {
  const passage = 'Artificial intelligence transforms modern engineering.';
  const spoken = 'Artificial intelligence transforms modern engineering.';
  const analysis = compareSpeechWithPassage(passage, spoken, 10);
  assert.equal(analysis.readingAccuracy, 100);
  assert.equal(analysis.missingWords.length, 0);
  assert.equal(analysis.incorrectWords.length, 0);
  assert.equal(analysis.overallRating, 'EXCELLENT');
});

test('evaluateProctoringViolation correctly increments warnings and detects auto-submit trigger', () => {
  const eval1 = evaluateProctoringViolation(0, 3, 'looking_away');
  assert.equal(eval1.warningNumber, 1);
  assert.equal(eval1.isAutoSubmitTriggered, false);

  const eval2 = evaluateProctoringViolation(1, 3, 'tab_switch');
  assert.equal(eval2.warningNumber, 2);
  assert.equal(eval2.isAutoSubmitTriggered, false);

  const eval3 = evaluateProctoringViolation(2, 3, 'multiple_faces');
  assert.equal(eval3.warningNumber, 3);
  assert.equal(eval3.isAutoSubmitTriggered, true);
});

test('analyzeStudentAreaDeficiencies identifies weaknesses and mastered topics correctly', async () => {
  const { analyzeStudentAreaDeficiencies } = await import('./studentAnalysis');
  const dummyQuestions: Question[] = [
    {
      id: 'q1',
      subject: 'Cyber Security',
      unit: 1,
      topic: 'Asymmetric Cryptography',
      type: 'mcq',
      questionText: 'Q1',
      correctAnswer: 'A',
      marks: 2,
      negativeMarks: 0,
      difficulty: 'medium',
      explanation: '',
      createdAt: '2026-01-01',
    },
    {
      id: 'q2',
      subject: 'Cyber Security',
      unit: 2,
      topic: 'Network Firewalls',
      type: 'mcq',
      questionText: 'Q2',
      correctAnswer: 'B',
      marks: 2,
      negativeMarks: 0,
      difficulty: 'medium',
      explanation: '',
      createdAt: '2026-01-01',
    },
  ];

  // Student got q1 correct (100% in Asymmetric Cryptography), but q2 wrong (0% in Network Firewalls)
  const answers = { q1: 'A', q2: 'C' };
  const report = analyzeStudentAreaDeficiencies(answers, dummyQuestions, 'stu-1', 'Dhanush R');

  assert.equal(report.masteredTopics.length, 1);
  assert.equal(report.masteredTopics[0].topic, 'Asymmetric Cryptography');
  assert.equal(report.criticalWeaknesses.length, 1);
  assert.equal(report.criticalWeaknesses[0].topic, 'Network Firewalls');
  assert.ok(report.priorityImprovementAdvice[0].includes('Network Firewalls'));
});

