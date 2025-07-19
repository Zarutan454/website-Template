# Story-Komponente – Dokumentation

## 1. Überblick

Die Story-Komponente ermöglicht es Nutzern, wie bei Instagram oder Facebook, temporäre Inhalte (Stories) zu erstellen, anzusehen und mit Musik zu versehen. Sie ist vollständig in das Social Network integriert und unterstützt Bilder, Videos, Text, Musik (Spotify), Sticker und mehr.

---

## 2. Hauptfunktionen

### A. Story-Erstellung
- **Modal mit mehreren Tabs:**
  - Bild/Video-Upload
  - Text-Story
  - Musik (Spotify-Suche & Auswahl)
  - Sticker, Polls etc. (je nach Ausbaustufe)
- **Upload-Flow:**
  - Medien werden über das Story-Modal hochgeladen (`/api/upload/media/`).
  - Nach erfolgreichem Upload wird die Story per API erstellt.
  - Musik kann als Metadaten (inkl. Spotify preview_url) angehängt werden.
- **UX:**
  - Fortschrittsanzeige beim Upload
  - Fehler- und Erfolgsfeedback
  - Avatar des Nutzers wird angezeigt

### B. Story-Viewer
- **Anzeige aller aktiven Stories:**
  - Stories werden als horizontale Liste (Story-Bubbles) angezeigt.
  - Beim Klick öffnet sich der Story-Viewer (ähnlich wie bei Instagram).
- **Features im Viewer:**
  - Automatisches Abspielen von Bildern/Videos
  - Musik-Preview (30s, falls von Spotify verfügbar)
  - UI zeigt an, wenn keine Musik-Preview vorhanden ist
  - Navigation zwischen Stories (vor/zurück)
  - Anzeige von Username, Avatar, Zeitstempel

### C. Musik-Integration (Spotify)
- **Echte Spotify-Suche:**
  - Nutzer können nach Songs suchen (API-Proxy `/api/spotify/search/?q=...`).
  - Suchergebnisse zeigen Titel, Artist, Cover, Play-Button für 30s-Preview.
- **Preview-Playback:**
  - Nutzer können die Vorschau direkt im Modal und im Viewer abspielen/stoppen.
  - Fallback: Hinweis, wenn keine Vorschau verfügbar ist.
- **Metadaten-Speicherung:**
  - Beim Auswählen eines Songs werden alle relevanten Metadaten (inkl. preview_url) im Story-Payload gespeichert.

### D. Backend-Integration
- **REST-API:**
  - Stories werden über dedizierte Endpunkte erstellt, abgerufen und verwaltet.
  - Medien-Uploads laufen über einen eigenen Upload-Endpunkt.
  - Musikdaten werden als JSON-Field an die Story angehängt.
- **Kompatibilität:**
  - SQLite-kompatible Felder (JSONField statt ArrayField)
  - Fehlerbehandlung für alle Upload- und API-Operationen

### E. Frontend-UX
- **Responsives Design:**
  - Funktioniert auf Desktop und Mobile
- **State-Management:**
  - Stories werden nach Upload automatisch im Feed/Viewer aktualisiert.
- **Fehlerbehandlung:**
  - Klare UI-Feedbacks bei Fehlern (z.B. kein Preview, Upload fehlgeschlagen)
- **Performance:**
  - Stories werden gecached und nur bei Bedarf neu geladen.

---

## 3. Komponentenstruktur (Frontend)

- **StoryCreationModal.tsx**  
  Modal für die Story-Erstellung mit Tabs für verschiedene Story-Typen.
- **StoryList.tsx**  
  Zeigt die Story-Bubbles im Feed an.
- **StoryViewer.tsx**  
  Vollbild-Viewer für Stories mit Navigation und Musik-Playback.
- **SpotifySearch.tsx**  
  UI-Komponente für die Spotify-Suche und Songauswahl.
- **StoryService.ts**  
  API-Client für Story-Operationen (CRUD, Upload, Musik).

---

## 4. Datenmodell (Backend/Frontend)

**Story:**
```json
{
  "id": 123,
  "user": 1,
  "media_url": "http://.../media/stories/xyz.jpg",
  "type": "image" | "video" | "text" | "music",
  "created_at": "2024-06-01T12:00:00Z",
  "music": {
    "title": "Songname",
    "artist": "Artist",
    "cover_url": "...",
    "preview_url": "...",
    "spotify_id": "..."
  },
  "text": "Optionaler Text"
}
```

---

## 5. Workflows

### A. Story erstellen
1. Nutzer öffnet das Story-Modal.
2. Wählt Medientyp (Bild, Video, Text, Musik).
3. Optional: Sucht und wählt einen Song (Spotify).
4. Medien werden hochgeladen, Story wird erstellt.
5. Story erscheint sofort in der Story-Liste.

### B. Story ansehen
1. Nutzer klickt auf eine Story-Bubble.
2. StoryViewer öffnet sich, zeigt Medien und Musik.
3. Musik-Preview kann abgespielt werden (sofern vorhanden).
4. Navigation zu weiteren Stories möglich.

---

## 6. Fehler- und Fallback-Handling

- **Kein Musik-Preview:**  
  UI zeigt klaren Hinweis, wenn keine Vorschau verfügbar ist.
- **Upload-Fehler:**  
  Upload-Status und Fehler werden im Modal angezeigt.
- **API-Fehler:**  
  Fehlerhafte API-Responses werden abgefangen und dem Nutzer angezeigt.

---

## 7. Erweiterbarkeit

- **Weitere Story-Typen:**  
  Einfach erweiterbar um Sticker, Polls, Links etc.
- **Weitere Musikdienste:**  
  Architektur erlaubt Integration weiterer Musik-APIs.
- **Analytics:**  
  Stories können für Analytics und Engagement ausgewertet werden.

---

## 8. Akzeptanzkriterien (Review-Checkliste)

- [x] Nutzer kann Story mit Bild, Video, Text oder Musik erstellen.
- [x] Spotify-Suche und Musik-Preview funktionieren.
- [x] Stories werden korrekt im Feed und Viewer angezeigt.
- [x] Musik-Preview ist abspielbar, Fallback bei fehlender Preview.
- [x] Fehler werden sauber behandelt und angezeigt.
- [x] Responsive und performant auf allen Geräten.

---

**Fazit:**  
Die Story-Komponente ist jetzt voll funktionsfähig, stabil und bereit für den produktiven Einsatz.  
Sie bietet ein modernes, Instagram-ähnliches Story-Erlebnis mit echter Musik-Integration und ist flexibel erweiterbar. 