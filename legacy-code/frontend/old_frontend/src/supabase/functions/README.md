
# Supabase Funktionen

Dieser Ordner enthält Dokumentation zu den Funktionen, die in der Supabase-Datenbank definiert sind.

## Wichtige Funktionen

### Mining-Funktionen
- `handle_mining_status_update` - Aktualisiert den Mining-Status eines Benutzers
- `update_mining_heartbeat` - Aktualisiert den Heartbeat-Zeitstempel für einen Benutzer
- `get_inactive_miners` - Gibt alle inaktiven Miner zurück
- `cleanup_stale_mining_states` - Bereinigt veraltete Mining-Zustände
- `check_and_reset_daily_mining_limits` - Überprüft und setzt tägliche Mining-Limits zurück
- `update_mining_activity_count` - Aktualisiert die Aktivitätszähler für einen Benutzer

### Benutzer-Funktionen
- `create_mining_stats_for_new_user` - Erstellt Mining-Statistiken für einen neuen Benutzer
- `ensure_user_profile` - Stellt sicher, dass ein Benutzerprofil existiert
- `ensure_user_notification_settings` - Stellt sicher, dass Benachrichtigungseinstellungen existieren
- `create_notification_settings` - Erstellt Benachrichtigungseinstellungen für einen Benutzer

### Gruppen-Funktionen
- `update_group_member_count` - Aktualisiert die Mitgliederzahl einer Gruppe
- `update_group_post_count` - Aktualisiert die Beitragszahl einer Gruppe

### Beziehungs-Funktionen
- `update_follower_count` - Aktualisiert die Follower-Anzahl eines Benutzers
- `update_following_count` - Aktualisiert die Following-Anzahl eines Benutzers
- `get_relationship_type` - Gibt den Beziehungstyp zwischen zwei Benutzern zurück

### Beitrags-Funktionen
- `increment_likes` - Erhöht die Like-Anzahl eines Beitrags
- `decrement_likes` - Verringert die Like-Anzahl eines Beitrags
- `increment_comments` - Erhöht die Kommentar-Anzahl eines Beitrags
- `increment_shares` - Erhöht die Share-Anzahl eines Beitrags

### Foto-Funktionen
- `update_album_photo_count` - Aktualisiert die Foto-Anzahl eines Albums

### Sonstige Funktionen
- `update_updated_at_column` - Aktualisiert das updated_at-Feld
- `update_last_activity` - Aktualisiert das last_activity_at-Feld
- `update_notification_settings_updated_at` - Aktualisiert das updated_at-Feld der Benachrichtigungseinstellungen
- `update_relationship_updated_at` - Aktualisiert das updated_at-Feld einer Beziehung
- `update_conversation_last_message_time` - Aktualisiert den Zeitstempel der letzten Nachricht einer Konversation
