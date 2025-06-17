
-- Trigger zum Löschen von Abonnements, wenn Posts gelöscht werden
-- (zusätzlich zur Foreign Key CASCADE Constraint)
CREATE OR REPLACE FUNCTION public.cleanup_post_subscriptions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Beim Löschen eines Posts alle Abonnements für diesen Post löschen
  -- Dies ist redundant zur CASCADE-Constraint, aber expliziter
  DELETE FROM post_subscriptions
  WHERE post_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Trigger für die cleanup_post_subscriptions Funktion
CREATE TRIGGER trigger_cleanup_post_subscriptions
BEFORE DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION cleanup_post_subscriptions();
