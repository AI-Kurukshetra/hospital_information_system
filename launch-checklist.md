# 🚀 Launch Checklist — Next.js + Supabase

Work through this before going live. Every unchecked item is a risk.

---

## 🗄️ Supabase

- [ ] Production Supabase project created (separate from staging)
- [ ] RLS enabled on every table (`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`)
- [ ] All RLS policies applied to production via `supabase db push`
- [ ] Auth redirect URLs configured for production domain
- [ ] Auth email templates customised (confirm email, password reset)
- [ ] SMTP configured (or Supabase default email confirmed as acceptable)
- [ ] Storage buckets created with correct access policies
- [ ] Database backups enabled (Supabase pro plan)
- [ ] Connection pooler URL confirmed in Vercel env (port 6543)
- [ ] Direct URL confirmed available for CI migrations (port 5432)

## 🔑 Auth

- [ ] Email confirmation flow tested end-to-end in production
- [ ] Password reset flow tested end-to-end
- [ ] OAuth provider(s) configured with production client credentials (if using)
- [ ] Session expiry and refresh tested (let a session expire, verify auto-refresh)
- [ ] Middleware correctly protecting all `/dashboard` and `/settings` routes

## 💳 Stripe

- [ ] Switched from test keys to live keys in Vercel env
- [ ] Stripe webhook configured to production URL
- [ ] Webhook signature verified (not just checking event type)
- [ ] `checkout.session.completed` handler tested with live mode
- [ ] Subscription `updated` and `deleted` handlers tested
- [ ] Customer Portal enabled and tested
- [ ] Trial period configured correctly

## 🌐 Vercel

- [ ] Custom domain configured + HTTPS working
- [ ] All environment variables set in Vercel dashboard (check `.env.example`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set to production project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set as server-only (no NEXT_PUBLIC_ prefix)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Preview deployments use staging Supabase project (not production)

## 🔒 Security

- [ ] `SUPABASE_SERVICE_ROLE_KEY` not in any client-side code
- [ ] `STRIPE_SECRET_KEY` not in any client-side code
- [ ] All Server Actions have `auth.getUser()` check at top
- [ ] No tables missing RLS (run the SQL check above)
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] CSP headers configured in `next.config.ts`
- [ ] File upload: max size + allowed types enforced server-side

## 🧪 Testing

- [ ] All unit tests passing (`pnpm test:unit`)
- [ ] All integration tests passing against local Supabase
- [ ] E2E tests passing against staging environment
- [ ] RLS cross-user tests passing (User B cannot see User A's data)
- [ ] Stripe checkout E2E tested in Stripe test mode
- [ ] Auth flow E2E tested (sign up → verify email → sign in → dashboard)

## 📊 Monitoring

- [ ] Sentry configured with production DSN
- [ ] Sentry source maps uploaded (check CI config)
- [ ] Vercel Analytics enabled
- [ ] Uptime monitor configured (Better Uptime / Checkly)
- [ ] Error alert thresholds set in Sentry
- [ ] Supabase DB metrics checked (connections, CPU, disk)

## 📧 Email

- [ ] Resend domain verified for production sending domain
- [ ] Transactional emails (welcome, password reset) tested in production
- [ ] From address is a real monitored inbox (not noreply)

## 📝 Docs & Legal

- [ ] Privacy policy live and linked in footer
- [ ] Terms of service live and linked
- [ ] Cookie/GDPR notice if applicable
- [ ] README updated with production setup instructions
- [ ] CHANGELOG has a v1.0.0 entry

## 🚦 Go / No-Go

- [ ] Product Manager sign-off on acceptance criteria
- [ ] Security Agent has reviewed and no CRITICAL/HIGH issues open
- [ ] QA Agent has certified (coverage ≥ 80%, zero critical bugs)
- [ ] DevOps Agent has verified one-command rollback works
- [ ] Team knows the on-call rotation for launch day
