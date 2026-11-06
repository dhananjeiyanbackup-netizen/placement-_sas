import { ViolationType } from '../types';

export interface ViolationEvaluation {
  warningNumber: number;
  isAutoSubmitTriggered: boolean;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export function evaluateProctoringViolation(
  currentViolationCount: number,
  maxAllowedWarnings: number = 3,
  violationType: ViolationType
): ViolationEvaluation {
  const newCount = currentViolationCount + 1;
  const isAutoSubmitTriggered = newCount >= maxAllowedWarnings;

  let severity: 'low' | 'medium' | 'high' = 'medium';
  if (['multiple_faces', 'mobile_phone_detected', 'tab_switch'].includes(violationType)) {
    severity = 'high';
  } else if (['right_click_attempt', 'copy_paste_attempt'].includes(violationType)) {
    severity = 'low';
  }

  let message = '';
  if (isAutoSubmitTriggered) {
    message = `Critical Violation: Warning limit reached (${newCount}/${maxAllowedWarnings}). Examination auto-submitted for admin review.`;
  } else if (newCount === maxAllowedWarnings - 1) {
    message = `FINAL WARNING (${newCount}/${maxAllowedWarnings}): Repeated infractions will cause automatic test termination!`;
  } else {
    message = `Warning ${newCount} of ${maxAllowedWarnings}: Suspicious event detected [${formatViolationName(violationType)}]. Please remain focused on your screen.`;
  }

  return {
    warningNumber: newCount,
    isAutoSubmitTriggered,
    severity,
    message,
  };
}

export function formatViolationName(type: ViolationType): string {
  switch (type) {
    case 'face_not_detected':
      return 'Face Not Visible';
    case 'multiple_faces':
      return 'Multiple Faces Detected';
    case 'mobile_phone_detected':
      return 'Mobile Phone Detected';
    case 'suspicious_object':
      return 'Unauthorized Device/Object';
    case 'looking_away':
      return 'Looking Away from Screen';
    case 'tab_switch':
      return 'Browser Tab Switch';
    case 'fullscreen_exit':
      return 'Full-screen Exited';
    case 'copy_paste_attempt':
      return 'Copy/Paste Attempted';
    case 'right_click_attempt':
      return 'Right Click Attempted';
    case 'suspicious_shortcut':
      return 'Restricted Keyboard Shortcut';
    default:
      return 'Proctoring Alert';
  }
}
