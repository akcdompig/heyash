-- Mirrors one_active_session_per_user: for the MVP, an operator (Ashley)
-- handles exactly one active conversation at a time. A second "accept"
-- request for a different session fails on this constraint.
CREATE UNIQUE INDEX "one_active_session_per_operator"
  ON "ConversationSession" ("operatorId")
  WHERE "status" = 'ACTIVE' AND "operatorId" IS NOT NULL;
