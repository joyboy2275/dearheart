export const dedicationCategories = [
  { value: "lost", label: "A love I lost", description: "For someone who is no longer here." },
  { value: "cherished", label: "A love I cherish", description: "For the person still close to your heart." },
  { value: "one-sided", label: "One-sided love", description: "For a feeling they may never know." },
  { value: "obsession", label: "I can't let go", description: "For a feeling that stayed longer than you meant it to." },
  { value: "unattainable", label: "A love I can't have", description: "For someone you know you cannot be with." },
] as const;

export type DedicationCategory = (typeof dedicationCategories)[number]["value"];
export const dedicationCategoryValues = dedicationCategories.map(item => item.value) as [DedicationCategory, ...DedicationCategory[]];

export const reportReasons = [
  { value: "harmful", label: "Harmful or threatening" },
  { value: "abusive", label: "Abusive or harassing" },
  { value: "inappropriate", label: "Inappropriate for this space" },
  { value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof reportReasons)[number]["value"];
export const reportReasonValues = reportReasons.map(item => item.value) as [ReportReason, ...ReportReason[]];
