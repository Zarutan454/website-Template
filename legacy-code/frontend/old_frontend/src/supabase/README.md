
# Supabase Datenbank-Dokumentation

Diese Dokumentation bietet einen Überblick über die Struktur und Komponenten der Supabase-Datenbank, die in diesem Projekt verwendet wird.

## Ordner-Struktur

- `/tables` - Enthält SQL-Definitionen für alle Tabellen in der Datenbank
- `/functions` - Dokumentation zu Datenbank-Funktionen
- `/triggers` - Dokumentation zu Datenbank-Triggern
- `/schema.sql` - Hauptschema-Datei mit den wichtigsten Definitionen

## Hauptkomponenten

### Benutzer-System
Das Benutzer-System umfasst Tabellen für Benutzerprofile, Beziehungen zwischen Benutzern und Benachrichtigungseinstellungen.

### Social-Media-Funktionen
Hierzu gehören Tabellen für Beiträge, Kommentare, Likes, Bookmarks und Hashtags.

### Mining-System
Das Mining-System umfasst Tabellen für Mining-Statistiken, Aktivitäten, Sitzungen und Statusverläufe.

### Gruppen
Tabellen für Gruppen, Gruppenmitglieder und Beiträge in Gruppen.

### Messaging-System
Hierzu gehören Tabellen für Konversationen, Nachrichten und ungelesene Nachrichten.

### Benachrichtigungssystem
Tabellen für Benachrichtigungen und deren Details.

### Foto-Management
Tabellen für Fotoalben und Fotos.

### Token und Krypto
Tabellen für Token-Definitionen und Krypto-Wallets.

## Verwendung in der Anwendung

Die Datenbank wird über die Supabase JavaScript-Client-Bibliothek angesprochen. Beispiel:

```typescript
import { supabase } from '@/lib/supabase';

// Daten abrufen
const { data, error } = await supabase
  .from('tableName')
  .select('*')
  .eq('column', 'value');

// Daten einfügen
const { data, error } = await supabase
  .from('tableName')
  .insert([{ column: 'value' }]);

// Daten aktualisieren
const { data, error } = await supabase
  .from('tableName')
  .update({ column: 'new_value' })
  .eq('id', 'record_id');

// Daten löschen
const { data, error } = await supabase
  .from('tableName')
  .delete()
  .eq('id', 'record_id');
```

## Sicherheit

Die Datenbank verwendet Row-Level Security (RLS), um den Zugriff auf Daten zu beschränken. Die meisten Tabellen ermöglichen es Benutzern nur, ihre eigenen Daten zu sehen und zu bearbeiten.

## Wartung und Aktualisierung

Bei Änderungen an der Datenbankstruktur sollten die entsprechenden SQL-Dateien in diesem Ordner aktualisiert werden, um die Dokumentation auf dem neuesten Stand zu halten.
