import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const token = authHeader.slice(7)

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw createError({ statusCode: 401, message: 'Invalid session' })
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) {
    throw createError({ statusCode: 500, message: 'Deploy hook not configured' })
  }

  const res = await fetch(hookUrl, { method: 'POST' })
  if (!res.ok) {
    throw createError({ statusCode: 502, message: 'Failed to trigger deploy' })
  }

  return { ok: true }
})
