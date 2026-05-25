'use server'

import { getMedicationsByCategory } from '@/lib/medications'
import { Medication, MedicationCategory } from '@/lib/medications'

export async function loadMoreMedications(
  category: MedicationCategory,
  offset: number
): Promise<Medication[]> {
  const supabase = await (await import('@/lib/supabase/server')).createClient()
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('name', { ascending: true })
    .range(offset, offset + 9)

  if (error) {
    console.error('[v0] loadMoreMedications error:', error)
    return []
  }
  return (data ?? []) as Medication[]
}
