# CreatePostBox – Blueprint (Facebook-Style)

## 1. Komponentenstruktur

- **CreatePostBox**
  - Avatar (User)
  - Textarea ("Was möchtest du teilen?")
  - Medien-Buttons (Bild, Video, Audio)
  - Emoji/Sticker-Picker
  - Privacy-Selector (Dropdown: Öffentlich, Freunde, Privat)
  - Location/Tagging (optional)
  - Live-Video (optional, später)
  - Post-Button (aktiviert, wenn Text oder Medien vorhanden)
  - Medien-Preview (Thumbnail, Video-Player, Audio-Player)
  - Upload-Status/Progressbar
  - Fehler- und Erfolgsmeldungen

## 2. Userflow

1. User sieht oben im Feed die CreatePostBox (sticky)
2. Klick in das Textfeld öffnet die volle Box (Textarea wächst, Medien-Buttons erscheinen)
3. User kann Text schreiben, Emojis/Stickers einfügen, Medien auswählen (Drag & Drop oder Button)
4. Privacy-Selector (Dropdown) wählt Sichtbarkeit
5. Optional: Location/Tagging, Live-Video
6. Klick auf "Posten" → Optimistic UI: Post erscheint sofort im Feed, Upload läuft im Hintergrund
7. Bei Erfolg: Input wird geleert, Erfolgsmeldung
8. Bei Fehler: Fehlerhinweis, Retry möglich

## 3. UI/UX-Prinzipien

- **Sticky:** Immer oben sichtbar, auch beim Scrollen
- **Klares, aufgeräumtes Layout:** Facebook-ähnliche Anordnung, große Buttons, klare Abstände
- **Barrierefreiheit:** ARIA-Labels, Keyboard-Navigation, Kontrast, Screenreader
- **Mobile First:** Touch-Optimierung, große Buttons, einfache Navigation
- **Optimistic UI:** Post erscheint sofort, Upload läuft asynchron
- **Fehler- und Erfolgsmeldungen:** Klar, unobtrusive, freundlich

## 4. Technische Hinweise

- **API-Integration:** Medien-Upload an Django-Endpoint, Post-API mit Privacy-Option
- **State-Management:** useState/useReducer für Input, Medien, Privacy, Upload-Status
- **Preview:** URL.createObjectURL für lokale Medien, Thumbnails für Bilder/Videos
- **Cleanup:** RevokeObjectURL nach Upload/Entfernen
- **Accessibility:** Tab-Order, ARIA, Fokus-Management

---

**Nächster Schritt:**

- Komponentenstruktur und Props im Code anlegen
- Privacy-Selector und Medien-Upload als eigene Subkomponenten planen
- Optimistic UI und Fehlerhandling vorbereiten
