# 🧠 Cursor-Regeln: Migration von Frontend-Komponenten

## Strukturregeln
- Verwende `old_frontend/` nur zum Lesen. Niemals verändern.
- Das neue UI entsteht ausschließlich in `frontend/`
- Änderungen am `backend/` sind untersagt.

## Migrationsvorgehen
- Prüfe, ob eine Komponente im alten Frontend vorhanden ist
- Falls ja:
  - Kopiere sie in den passenden Ordner unter `frontend/src/`
  - Entferne Supabase-Logik und ersetze sie mit Django-API-Calls
  - Verwende Axios + JWT-Auth + Zustand Store
- Falls nein:
  - Erstelle die Komponente neu gemäß UI-Richtlinien

## Dokumentationspflicht
- Jeder Migrationsschritt wird in `docs/migrations/migration-log.md` festgehalten
- Jede Komponente enthält:
  - `index.tsx`
  - `README.md` mit API, Props, Funktion
  - `style.module.css`
- Optional: `Component.test.tsx`

## Reihenfolge der Migration
1. LandingPage
2. Login
3. Register
4. Navbar
5. Feed
6. WalletDashboard
7. MiningWidget
8. Notifications
9. Gruppen

## Qualitätssicherung
- Teste jede Komponente nach Migration
- Führe manuelle Überprüfung der Funktionalität durch

## Selbstkorrektur-Routine
1. Prüfe zuerst die aktuelle Projektstruktur – ordne alle relevanten Verzeichnisse zu:
   - frontend (neu)
   - old_frontend (alt)
   - backend (nicht verändern)

2. Validierung jeder Aktion:
   - Wurde eine existierende Datei verändert? → Nur im frontend erlaubt
   - Wurde Supabase-Code übernommen? → Entfernen
   - Hat jede Komponente ein zugehöriges README? → Wenn nicht → generieren
   - Hat jede API-Kommunikation eine definierte Django-Route? → Falls nicht → markieren mit `# TODO: Route`

3. Fehlerbehandlung:
   - Wenn ein Fehler passiert, **markiere die Datei als `BROKEN`** in der `migration-log.md`
   - Versuche, über vorherige Schritte und gelernte Logik zu korrigieren 