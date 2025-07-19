# Feed UI/UX Blueprint – Facebook-Style (2024)

## 1. Komponentenstruktur

- **FeedLayout**
  - Sticky Sidebar (optional)
  - Stories-Section (bereits vorhanden)
  - **CreatePostBox** (immer sichtbar, sticky)
  - **FeedList** (Infinite Scroll)
    - **PostCard** (einzelner Post)
      - User-Avatar, Name, Zeitstempel, Privacy-Icon
      - Post-Content (Text, Bild, Video, Link, Musik, GIF, Sticker)
      - Interaktionen: Like (verschiedene Reaktionen), Kommentar, Teilen, Bookmark
      - Kommentar-Preview & -Box (inline)
      - Media-Preview (Lightbox/Modal)
      - Dropdown: Edit/Delete/Report

## 2. Userflow (Hauptabläufe)

### A. Post erstellen
1. User klickt in CreatePostBox ("Was möchtest du teilen?")
2. Wählt Medien, Emojis, Privacy, ggf. Location/Tagging
3. Klick auf "Posten" → API-Call → Feed aktualisiert sich sofort (optimistic update)

### B. Interagieren mit Posts
1. User sieht PostCard mit allen Interaktionsmöglichkeiten
2. Like/Reaction, Kommentar (inline), Teilen, Bookmark
3. Klick auf Medien öffnet Preview/Lightbox

### C. Feed-Nutzung
1. Feed ist infinite scrollbar, lädt neue Posts automatisch
2. Loading-States (Skeletons), Empty-States (freundliche Hinweise)
3. Responsives Layout für Mobile/Desktop

## 3. UI/UX-Prinzipien
- **Sticky CreatePostBox**: Immer oben sichtbar, auch beim Scrollen
- **Schnelle Interaktionen**: Optimistic UI, keine Wartezeiten
- **Barrierefreiheit**: ARIA-Labels, Keyboard-Navigation, Kontrast
- **Mobile First**: Touch-Optimierung, große Buttons, einfache Navigation
- **Konsistentes Design**: Facebook-ähnliche Farben, Abstände, Icons
- **Fehler- und Erfolgsmeldungen**: Klar, freundlich, unobtrusive

## 4. Backend-Integration
- **API-Endpoints**: Vollständige Unterstützung für alle Post-Typen, Interaktionen, Kommentare, Medien-Uploads
- **Echtzeit-Updates**: WebSocket/Push für neue Posts und Interaktionen (optional)
- **Optimistic Updates**: Frontend zeigt neue Posts sofort, Backend validiert nachträglich
- **Fehlerhandling**: Klare Rückmeldungen bei API-Fehlern

---

**Nächster Schritt:**
- Komponentenliste und Aufgaben für die Umsetzung anlegen (ToDo-Board)
- Optional: Mockup/Skizze für visuelle Orientierung 