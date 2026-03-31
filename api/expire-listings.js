import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)

  const { data, error } = await supabase
    .from('properties')
    .update({ activa: false })
    .eq('activa', true)
    .lt('created_at', cutoff.toISOString())
    .select('id')

  return res.status(200).json({ expired: data?.length || 0, error: error?.message })
}
