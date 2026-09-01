import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorizzato' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error } = await supabase
      .from('auto')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) throw error;

    console.log(`[keep-alive] OK - ${new Date().toISOString()}`);
    return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[keep-alive] Errore:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
