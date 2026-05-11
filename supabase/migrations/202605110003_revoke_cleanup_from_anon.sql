-- Security hardening: pe_cleanup_expired_state must not be callable by anon/public.
-- This was granted via harden_pilot_security but that migration used GRANT EXECUTE ON ALL FUNCTIONS
-- which included cleanup. This migration permanently revokes it.
revoke all on function public.pe_cleanup_expired_state() from public;
revoke all on function public.pe_cleanup_expired_state() from anon;
revoke all on function public.pe_cleanup_expired_state() from authenticated;
