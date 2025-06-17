
# Supabase Trigger

Dieser Ordner enthält Dokumentation zu den Triggern, die in der Supabase-Datenbank definiert sind.

## Wichtige Trigger

### Mining-Trigger
- `check_daily_mining_limits` - Überprüft und setzt tägliche Mining-Limits zurück
- `update_mining_activity_counts` - Aktualisiert Mining-Aktivitätszähler

### Benutzer-Trigger
- `on_auth_user_created` - Wird ausgelöst, wenn ein neuer Benutzer erstellt wird
- `ensure_notification_settings_on_user_created` - Stellt sicher, dass Benachrichtigungseinstellungen existieren
- `on_user_created` - Erstellt Mining-Statistiken für einen neuen Benutzer
- `update_users_updated_at` - Aktualisiert das updated_at-Feld eines Benutzers

### Gruppen-Trigger
- `group_member_count_trigger` - Aktualisiert die Mitgliederzahl einer Gruppe
- `group_post_count_trigger` - Aktualisiert die Beitragszahl einer Gruppe

### Foto-Trigger
- `album_photos_insert_trigger` - Aktualisiert die Foto-Anzahl eines Albums
- `album_photos_delete_trigger` - Aktualisiert die Foto-Anzahl eines Albums nach dem Löschen

### Nachrichten-Trigger
- `update_conversation_timestamp` - Aktualisiert den Zeitstempel einer Konversation

### Sonstige Trigger
- `set_notification_settings_updated_at` - Aktualisiert das updated_at-Feld der Benachrichtigungseinstellungen
- `set_user_notification_settings_updated_at` - Aktualisiert das updated_at-Feld der Benutzer-Benachrichtigungseinstellungen
- `set_relationship_updated_at` - Aktualisiert das updated_at-Feld einer Beziehung
- `update_user_activity_log_updated_at` - Aktualisiert das updated_at-Feld des Benutzeraktivitätslogs
- `update_mining_activities_updated_at` - Aktualisiert das updated_at-Feld der Mining-Aktivitäten
- `update_hashtags_updated_at` - Aktualisiert das updated_at-Feld der Hashtags
