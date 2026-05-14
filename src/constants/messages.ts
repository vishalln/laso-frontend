/**
 * Message and greeting utilities for consistent user experience
 * Centralized messaging ensures uniformity across all portals
 */

/**
 * Get time-based greeting for user
 * Returns appropriate greeting based on current time of day
 * @param firstName - User's first name
 * @returns Time-appropriate greeting string
 */
export const getTimeBasedGreeting = (firstName: string): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return `Good morning, ${firstName} 👋`;
  } else if (hour < 18) {
    return `Good afternoon, ${firstName} 👋`;
  } else {
    return `Good evening, ${firstName} 👋`;
  }
};

/**
 * Get welcome message for first-time users or onboarding
 * @param firstName - User's first name
 * @returns Welcome message
 */
export const getWelcomeMessage = (firstName: string): string => 
  `Welcome to Laso, ${firstName} 👋`;

/**
 * Get onboarding-specific greeting
 * Used in special onboarding contexts or first-time user flows
 * @param firstName - User's first name
 * @returns Onboarding greeting
 */
export const getOnboardingGreeting = (firstName: string): string =>
  `Welcome to Laso, ${firstName} 👋`;

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  SETTINGS_SAVED: "Settings saved successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  EMAIL_VERIFIED: "Email verified successfully",
} as const;

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
} as const;

export const QUIZ_MESSAGES = {
  RESULT_TITLE: "Your Eligibility Result",
  ELIGIBLE_LABEL: "Eligible",
  NOT_ELIGIBLE_LABEL: "Not Eligible",
  ELIGIBLE_DESCRIPTION: "Based on your responses, you meet the clinical criteria for GLP-1 therapy. Start your programme or book a consultation with a specialist.",
  NOT_ELIGIBLE_DESCRIPTION: "Based on your current metrics, you don't meet the criteria yet. You can retake the quiz if your health profile changes.",
  RETAKE_BUTTON: "Retake Quiz",
  START_PROGRAMME_CTA: "Start Your Programme",
  SUBMITTED_PREFIX: "Submitted",
  ANONYMOUS_QUIZ_KEY: "laso_pending_quiz_id",
  CREATE_ACCOUNT_CTA: "Create account to continue",
} as const;
