import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://uma-boron.pages.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?'
  const bytes = crypto.getRandomValues(new Uint8Array(22))
  const random = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
  return `U!${random}9a`
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authorization = request.headers.get('Authorization')
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) return json({ error: 'Unauthorized' }, 401)

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  })
  const { data: callerData, error: callerError } = await callerClient.auth.getUser()
  const caller = callerData.user
  if (callerError || !caller || caller.app_metadata?.role !== 'admin') return json({ error: 'Administrator access required' }, 403)

  let email = ''
  try {
    const body = await request.json()
    email = String(body?.email || '').trim().toLowerCase()
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json({ error: 'Valid email required' }, 400)

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentInviteCount, error: countError } = await adminClient
    .from('admin_invites')
    .select('id', { count: 'exact', head: true })
    .eq('invited_by', caller.id)
    .gte('created_at', oneHourAgo)
  if (countError) return json({ error: 'Invitation audit is unavailable' }, 503)
  if ((recentInviteCount || 0) >= 10) return json({ error: 'Hourly administrator invitation limit reached' }, 429)

  const temporaryPassword = generateTemporaryPassword()
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: 'https://uma-boron.pages.dev/',
    data: { force_password_change: true, password_enabled: false, invited_as_admin: true },
  })
  if (error || !data.user) return json({ error: error?.message || 'Invitation failed' }, error?.status || 400)

  const { error: updateError } = await adminClient.auth.admin.updateUserById(data.user.id, {
    password: temporaryPassword,
    app_metadata: { ...data.user.app_metadata, role: 'admin', invited_by: caller.id },
    user_metadata: { ...data.user.user_metadata, force_password_change: true, password_enabled: false },
  })
  if (updateError) return json({ error: updateError.message }, 500)

  await adminClient.from('admin_invites').insert({
    invited_email: email,
    invited_by: caller.id,
    invited_user_id: data.user.id,
  })

  return json({ email, temporaryPassword, invitationSent: true })
})
