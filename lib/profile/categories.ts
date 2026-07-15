export const PROFILE_CATEGORIES = [
  "overview",
  "accountdetails",
  "security",
  "preferences",
] as const;

export const PROFILE_CATEGORY_META: Record<
  (typeof PROFILE_CATEGORIES)[number],
  { label: string; description: string }
> = {
  overview: {
    label: "Overview",
    description: "Track your playable backlog with status.",
  },
  accountdetails: {
    label: "Account Details",
    description:
      "Manage your account information, including email, password, and personal details.",
  },
  security: {
    label: "Security",
    description:
      "Update your security settings, including two-factor authentication and login alerts.",
  },
  preferences: {
    label: "Preferences",
    description:
      "Customize your experience by adjusting your preferences and settings.",
  },
};

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number];

export function parseProfileCategory(
  value: string | null | undefined,
): ProfileCategory {
  if (!value) {
    return "overview";
  }

  const normalized = value.toLowerCase();
  return PROFILE_CATEGORIES.includes(normalized as ProfileCategory)
    ? (normalized as ProfileCategory)
    : "overview";
}

export function parseProfileCategoryStrict(
  value: string | null | undefined,
): ProfileCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  return PROFILE_CATEGORIES.includes(normalized as ProfileCategory)
    ? (normalized as ProfileCategory)
    : null;
}
