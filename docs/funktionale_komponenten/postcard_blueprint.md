# PostCard – Blueprint (Facebook-Style)

## 1. Komponentenstruktur

- **PostCard**
  - Header
    - Avatar (User)
    - Name (Display Name, Username)
    - Zeitstempel (z.B. "vor 2 Min.")
    - **Privacy-Icon/Label** (Öffentlich, Freunde, Privat)
    - Gruppe/Seite (optional)
    - Dropdown-Menü (Edit, Delete, Report)
  - Content
    - Text (mit Hashtag- und Link-Parsing)
    - Medien-Preview (Bild, Video, Audio, mehrere Medien, Lightbox)
    - Hashtags als klickbare Chips
  - Interaktionsleiste
    - Like (verschiedene Reaktionen, optional)
    - Kommentar (Anzahl, Button)
    - Teilen (Button, Zähler)
    - Bookmark (Button)
  - Kommentar-Preview (letzte 1-2 Kommentare, Button für alle)
  - Footer (optional: Mining, Token, NFT, etc.)

## 2. UI/UX-Prinzipien
- **Privacy-Icon:** Klar sichtbar neben Name/Zeit, Tooltip mit Bedeutung
- **Meta-Info-Leiste:** Kompakt, alle Infos auf einen Blick
- **Medien-Preview:** Responsive, Lightbox für große Ansicht, mehrere Medien als Karussell
- **Interaktionsleiste:** Große, klickbare Buttons, animiert, barrierefrei
- **Dropdown-Menü:** Edit/Delete/Report, nur für Owner/Admin sichtbar
- **Accessibility:** ARIA-Labels, Keyboard-Navigation, Kontrast, Fokus-Styles
- **Mobile First:** Touch-Optimierung, große Buttons, einfache Navigation

## 3. Erweiterbarkeit
- Token/NFT-Badges, Mining-Status, Gruppen-Posts, Pinned/Sponsored-Posts
- Reactions-Auswahl (verschiedene Like-Typen)
- Kommentar-Threading, Inline-Kommentare

---

**Nächster Schritt:**
- Komponentenstruktur und Props im Code anlegen
- Privacy-Icon/Label als eigene Subkomponente planen
- Schrittweise Redesign und Integration in Feed 