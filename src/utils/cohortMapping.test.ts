import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Question, Exam, ExamResult } from '../types';

test('Questions map accurately to Department and Academic Year', () => {
  const sampleQuestions: Partial<Question>[] = [
    { id: 'q1', departmentName: 'CSE (Cyber Security)', year: 'III', subjectCode: 'CS3501' },
    { id: 'q2', departmentName: 'AI & Data Science', year: 'III', subjectCode: 'AD3401' },
    { id: 'q3', departmentName: 'CSE (Cyber Security)', year: 'II', subjectCode: 'CS3301' },
  ];

  const cseYear3Questions = sampleQuestions.filter(
    (q) => q.departmentName === 'CSE (Cyber Security)' && q.year === 'III'
  );
  assert.strictEqual(cseYear3Questions.length, 1);
  assert.strictEqual(cseYear3Questions[0].id, 'q1');

  const aidsYear3Questions = sampleQuestions.filter(
    (q) => q.departmentName === 'AI & Data Science' && q.year === 'III'
  );
  assert.strictEqual(aidsYear3Questions.length, 1);
  assert.strictEqual(aidsYear3Questions[0].id, 'q2');
});

test('Student exam visibility strictly adheres to student Department, Year, and Section', () => {
  const sampleExams: Partial<Exam>[] = [
    {
      id: 'e1',
      departmentName: 'CSE (Cyber Security)',
      year: 'III',
      section: 'A',
    },
    {
      id: 'e2',
      departmentName: 'CSE (Cyber Security)',
      year: 'II',
      section: 'A',
    },
    {
      id: 'e3',
      departmentName: 'AI & Data Science',
      year: 'III',
      section: 'All',
    },
  ];

  const studentCseYear3SecA = {
    departmentName: 'CSE (Cyber Security)',
    year: 'III',
    section: 'A',
  };

  const studentExams = sampleExams.filter((e) => {
    const matchDept = !e.departmentName || e.departmentName === 'All' || e.departmentName === studentCseYear3SecA.departmentName;
    const matchYear = !e.year || (e.year as string) === 'All' || e.year === studentCseYear3SecA.year;
    const matchSection = !e.section || e.section === 'All' || e.section === studentCseYear3SecA.section;
    return matchDept && matchYear && matchSection;
  });

  assert.strictEqual(studentExams.length, 1);
  assert.strictEqual(studentExams[0].id, 'e1');
});

test('Department-wise pass rate and average calculations are aggregate correctly', () => {
  const sampleResults: Partial<ExamResult>[] = [
    { departmentName: 'CSE (Cyber Security)', percentage: 100, passed: true },
    { departmentName: 'CSE (Cyber Security)', percentage: 80, passed: true },
    { departmentName: 'AI & Data Science', percentage: 90, passed: true },
    { departmentName: 'AI & Data Science', percentage: 40, passed: false },
  ];

  const cseResults = sampleResults.filter((r) => r.departmentName === 'CSE (Cyber Security)');
  const csePassRate = Math.round((cseResults.filter((r) => r.passed).length / cseResults.length) * 100);
  const cseAvg = Math.round((cseResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / cseResults.length) * 10) / 10;

  assert.strictEqual(csePassRate, 100);
  assert.strictEqual(cseAvg, 90);

  const aidsResults = sampleResults.filter((r) => r.departmentName === 'AI & Data Science');
  const aidsPassRate = Math.round((aidsResults.filter((r) => r.passed).length / aidsResults.length) * 100);
  const aidsAvg = Math.round((aidsResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / aidsResults.length) * 10) / 10;

  assert.strictEqual(aidsPassRate, 50);
  assert.strictEqual(aidsAvg, 65);
});
