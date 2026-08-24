-- Hand-written: these two constraints can't be expressed in schema.prisma
-- (no table-level CHECK, no partial/filtered unique index in the schema DSL),
-- so they're added here directly. They are the DB-level backstop for the
-- credit-ledger and one-active-session invariants described in lib/credits
-- and lib/sessions.

-- A user's cached balance can never go negative, no matter what application
-- bug or race condition might otherwise cause it.
ALTER TABLE "User"
  ADD CONSTRAINT "creditBalance_nonnegative" CHECK ("creditBalance" >= 0);

-- A user can have at most one conversation session that is waiting, active,
-- or in its grace period at any given time. A second "start conversation"
-- request fails on this constraint instead of racing.
CREATE UNIQUE INDEX "one_active_session_per_user"
  ON "ConversationSession" ("userId")
  WHERE "status" IN ('WAITING', 'ACTIVE', 'GRACE');
