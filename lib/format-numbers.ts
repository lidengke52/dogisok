/**
 * Format large numbers with K (thousands) and M (millions) suffix
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "30M+", "1.7K+"
 */
export function formatCompactNumber(num: number, decimals: number = 1): string {
  if (num >= 1_000_000) {
    const millions = num / 1_000_000
    return `${millions.toFixed(decimals).replace(/\.?0+$/, '')}M+`
  }

  if (num >= 1_000) {
    const thousands = num / 1_000
    return `${thousands.toFixed(decimals).replace(/\.?0+$/, '')}K+`
  }

  return `${num}+`
}

/**
 * Format specific statistics
 */
export const statistics = {
  symptomConsultations: 30_000_000,
  drugTypes: 1_700,
  breedsCovered: 100,
} as const

export function getFormattedStatistics() {
  return {
    symptomConsultations: formatCompactNumber(statistics.symptomConsultations),
    drugTypes: formatCompactNumber(statistics.drugTypes),
    breedsCovered: formatCompactNumber(statistics.breedsCovered),
  }
}
