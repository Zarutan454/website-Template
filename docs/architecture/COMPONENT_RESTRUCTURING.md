# Komponenten-Umstrukturierung

Dieses Dokument beschreibt den Plan zur Umstrukturierung der Komponenten im BSN Website-Template für eine bessere Wartbarkeit.

## Aktuelle Probleme

1. **Große Komponenten**: Viele Komponenten haben über 300 Zeilen Code, was die Wartung erschwert
2. **Keine klare Trennung**: Keine klare Trennung zwischen UI-Komponenten und Container-Komponenten
3. **Keine konsistente Struktur**: Keine gemeinsame Struktur für wiederverwendbare Komponenten
4. **Keine Trennung nach Funktionalität**: Komponenten sind nicht nach Funktionalität oder Feature organisiert

## Neue Struktur

Die neue Struktur folgt dem Atomic Design Prinzip und organisiert Komponenten in:

```text
src/
  components/
    atoms/          # Grundlegende UI-Elemente (Buttons, Inputs, etc.)
    molecules/      # Kombinationen von Atomen (Cards, Form Fields, etc.)
    organisms/      # Komplexe UI-Komponenten (Forms, Feature Blocks, etc.)
    templates/      # Seitenlayouts und Strukturen
    sections/       # Vollständige Seitenabschnitte
    animations/     # Animation-Komponenten
    ui/             # UI-Kit Komponenten
  containers/       # Container-Komponenten mit Logik
  hooks/           # Custom React Hooks
  utils/           # Hilfsfunktionen
  pages/           # Seitenkomponenten
  context/         # React Context Provider
```

## Umstrukturierungsplan

### 1. Atoms erstellen

Grundlegende UI-Elemente:

- `Button.jsx` - Verschiedene Button-Stile
- `Input.jsx` - Formular-Eingabefelder
- `Typography.jsx` - Text-Komponenten (Headings, Paragraphs)
- `Icon.jsx` - Icon-Komponenten
- `Badge.jsx` - Badge/Tag-Komponenten
- `Spinner.jsx` - Lade-Animation

### 2. Molecules erstellen

Kombinationen von Atomen:

- `Card.jsx` - Karten-Komponenten
- `FormField.jsx` - Label + Input + Error Message
- `IconButton.jsx` - Button mit Icon
- `Tooltip.jsx` - Tooltip-Komponenten
- `Alert.jsx` - Alert/Notification-Komponenten
- `Dropdown.jsx` - Dropdown-Menüs

### 3. Organisms erstellen

Komplexere UI-Komponenten:

- `FeatureCard.jsx` - Feature-Karte mit Icon, Titel und Beschreibung
- `FormSection.jsx` - Gruppierte Formularfelder
- `Modal.jsx` - Modal/Dialog-Komponenten
- `Tabs.jsx` - Tab-Navigation
- `Accordion.jsx` - Accordion/Collapsible-Komponenten
- `DataTable.jsx` - Tabelle für Daten

### 4. Templates erstellen

Seitenlayouts und Strukturen:

- `PageLayout.jsx` - Grundlegendes Seitenlayout
- `SectionLayout.jsx` - Layout für Seitenabschnitte
- `GridLayout.jsx` - Grid-basiertes Layout

### 5. Bestehende Komponenten aufteilen

Große Komponenten in kleinere, wiederverwendbare Komponenten aufteilen:

#### Navbar.jsx

- `Logo.jsx` (atom)
- `NavigationLink.jsx` (atom)
- `MobileMenu.jsx` (organism)
- `DesktopMenu.jsx` (organism)
- `NavbarContainer.jsx` (container)

#### Hero.jsx

- `HeroTitle.jsx` (molecule)
- `HeroContent.jsx` (organism)
- `CountdownTimer.jsx` (molecule)
- `AnimatedLogo.jsx` (molecule)
- `HeroContainer.jsx` (container)

#### FeatureSection.jsx

- `FeatureCard.jsx` (organism)
- `FeatureGrid.jsx` (template)
- `FeatureSectionContainer.jsx` (container)

#### Forms

- `FormContainer.jsx` (container)
- `FormSubmitButton.jsx` (molecule)
- `FormInput.jsx` (molecule)
- `FormCheckbox.jsx` (molecule)
- `FormSelect.jsx` (molecule)

### 6. UI-Kit erstellen

Gemeinsame UI-Komponenten:

- `SectionTitle.jsx` - Aus App.jsx extrahieren
- `BlockchainBackground.jsx` - Aus App.jsx extrahieren
- `EnhancedBackground.jsx` - Aus App.jsx extrahieren
- `GradientText.jsx` - Für Gradient-Text-Effekte
- `GlassCard.jsx` - Für Glass-Morphismus-Effekte

### 7. Container-Komponenten erstellen

Logik von UI-Komponenten trennen:

- `NavbarContainer.jsx` - Navbar-Logik
- `HeroContainer.jsx` - Hero-Logik
- `FeatureSectionContainer.jsx` - Feature-Section-Logik
- `FormContainer.jsx` - Formular-Logik
- `TokenomicsContainer.jsx` - Tokenomics-Logik

### 8. Custom Hooks extrahieren

Wiederverwendbare Logik in Custom Hooks extrahieren:

- `useScrollAnimation.js` - Bereits vorhanden
- `useForm.js` - Formular-Logik
- `useCountdown.js` - Countdown-Logik
- `useWindowSize.js` - Fenstergröße
- `useLocalStorage.js` - LocalStorage-Zugriff

## Implementierungsplan

1. Verzeichnisstruktur erstellen
2. Atoms und Molecules implementieren
3. Organisms und Templates implementieren
4. UI-Kit-Komponenten extrahieren
5. Container-Komponenten erstellen
6. Custom Hooks extrahieren
7. Bestehende Komponenten schrittweise umstellen
8. Tests für neue Komponenten schreiben

## Vorteile der neuen Struktur

1. **Bessere Wartbarkeit**: Kleinere, fokussierte Komponenten
2. **Wiederverwendbarkeit**: Komponenten können leichter wiederverwendet werden
3. **Konsistenz**: Einheitliche Struktur und Design
4. **Trennung von Belangen**: UI und Logik sind getrennt
5. **Einfachere Tests**: Komponenten können isoliert getestet werden
6. **Bessere Dokumentation**: Klare Struktur erleichtert das Verständnis
7. **Skalierbarkeit**: Neue Features können leichter hinzugefügt werden 