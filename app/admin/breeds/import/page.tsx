import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { BulkImportBreedsForm } from '@/components/admin/bulk-import-breeds-form'

export const metadata = {
  title: 'Import Breeds',
  description: 'Bulk import dog breeds from XLSX or CSV file',
}

export default async function ImportBreedsPage() {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user || !(await isAdmin(user.id))) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Breeds</h1>
        <p className="text-muted-foreground mt-2">
          Upload XLSX or CSV file to bulk import dog breed data
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <BulkImportBreedsForm />
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-sm text-blue-900">
        <h3 className="font-semibold mb-2">File Format Requirements:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Header row: Dog breeds, English name, summary, Origins, Lifetime, Weight range, Shoulder height range, Character key words, Precautions for feeding, Common health issues, Grouping, body shape, training, Hair shedding, Sports needs, Is it appropriate to get along with children</li>
          <li>Each row represents one breed</li>
          <li>Supported formats: XLSX, XLS, CSV</li>
        </ul>
      </div>
    </div>
  )
}
