# BSN Datenbank – Dokumentation & Analyse

In diesem Ordner findest du die vollständige Analyse und Dokumentation der BSN-Datenbankstruktur.

## Übersicht der Dateien

- **BSN_DB_Schema.md**
  - Tabellarische Übersicht aller Datenbankmodelle, Felder, Beziehungen und Constraints.
- **BSN_DB_ERD.txt**
  - Textuelle Beschreibung des Entity-Relationship-Diagramms (ERD) für dbdiagram.io oder ähnliche Tools.
- **BSN_DB_Statistik.md**
  - Typische Auswertungen, Beispiel-Statistiken und Integritäts-Queries für die wichtigsten Tabellen.
- **BSN_DB_Best_Practices.md**
  - Technische Hinweise, Risiken, Best Practices und Optimierungsvorschläge für Betrieb und Weiterentwicklung.

## Nutzungshinweise
- Die Dokumentation ist automatisch aus dem aktuellen Datenbankschema generiert.
- Für visuelle ERDs kann die Datei `BSN_DB_ERD.txt` z.B. auf [dbdiagram.io](https://dbdiagram.io) importiert werden.
- Die Statistik- und Prüf-Queries sind für das Django ORM geschrieben, können aber leicht in SQL übersetzt werden.
- Bei Änderungen am Datenbankschema sollte die Dokumentation aktualisiert werden.

---

*Letzte Aktualisierung: Automatisch generiert.* 