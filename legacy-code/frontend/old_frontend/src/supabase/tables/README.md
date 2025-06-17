
# Supabase Datenbank-Tabellen

Dieser Ordner enthält SQL-Definitionen für alle Tabellen, die in der Supabase-Datenbank verwendet werden.

## Tabellen-Übersicht

### Benutzer und Profile
- `users.sql` - Benutzerprofile
- `user_relationships.sql` - Beziehungen zwischen Benutzern
- `user_followers.sql` - Follower-Beziehungen
- `follows.sql` - Folge-Beziehungen
- `user_notification_settings.sql` - Benachrichtigungseinstellungen

### Social-Media-Features
- `posts.sql` - Beiträge
- `comments.sql` - Kommentare
- `likes.sql` - Likes
- `bookmarks.sql` - Gespeicherte Beiträge
- `hashtags.sql` - Hashtags

### Mining-System
- `mining_stats.sql` - Mining-Statistiken für jeden Benutzer
- `mining_activities.sql` - Mining-Aktivitäten
- `mining_sessions.sql` - Mining-Sitzungen
- `mining_status_history.sql` - Historie der Mining-Statusänderungen

### Gruppen
- `groups.sql` - Gruppen
- `group_members.sql` - Gruppenmitglieder
- `group_posts.sql` - Beiträge in Gruppen

### Nachrichten
- `conversations.sql` - Konversationen
- `messages.sql` - Nachrichten
- `unread_messages_count.sql` - Anzahl ungelesener Nachrichten

### Benachrichtigungen
- `notifications.sql` - Benachrichtigungen
- `notification_details.sql` - Details zu Benachrichtigungen

### Foto-Management
- `photo_albums.sql` - Fotoalben
- `album_photos.sql` - Fotos in Alben

### Token und Krypto
- `tokens.sql` - Token-Definitionen

### Aktivitäten und Berichterstattung
- `user_activity_log.sql` - Benutzeraktivitäten
- `reports.sql` - Gemeldete Inhalte

### Suche
- `user_search.sql` - Benutzersuche

## Verwendung

Diese SQL-Dateien dienen als Referenz für die Datenbankstruktur. Wenn Sie Änderungen an der Datenbankstruktur vornehmen möchten, empfiehlt es sich, die entsprechende SQL-Datei zu aktualisieren und dann die Änderungen in der Supabase-Konsole oder über eine Migration umzusetzen.
