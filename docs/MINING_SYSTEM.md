# BSN Mining-System

## Überblick

Das Mining-System ist ein Kernbestandteil des BSN (Blockchain Social Network) und ermöglicht es Nutzern, durch aktive Teilnahme am Netzwerk BSN-Token zu verdienen. Es kombiniert Social-Media-Aktivitäten mit einem Belohnungssystem, das auf Blockchain-Prinzipien basiert.

## Grundprinzipien

1. **Session-basiertes Mining**: Nutzer "minen" Token, während sie aktiv im Netzwerk sind
2. **Aktivitätsabhängige Belohnungen**: Höhere Aktivität führt zu höheren Mining-Raten
3. **Boost-System**: Bestimmte Aktionen erhöhen temporär die Mining-Rate
4. **Tageslimit**: Begrenzung der täglich minieerbaren Token pro Nutzer
5. **Anti-Fraud-Mechanismen**: Verhinderung von Missbrauch und Bot-Aktivitäten

## Mining-Mechanik

### Mining-Session

- Eine Mining-Session beginnt automatisch beim Login oder bei Aktivität auf der Plattform
- Die Session bleibt aktiv, solange der Nutzer Aktivitäten zeigt (Heartbeat-System)
- Bei Inaktivität wird die Session nach einer festgelegten Zeit (z.B. 5 Minuten) pausiert
- Die Mining-Rate wird in Token pro Minute gemessen

### Basis-Mining-Rate

- Jeder Nutzer hat eine Basis-Mining-Rate (z.B. 0.01 BSN-Token pro Minute)
- Diese Rate kann durch verschiedene Faktoren erhöht werden:
  - Nutzerlevel/Erfahrung
  - Länge der Mitgliedschaft
  - Besitz von NFTs oder speziellen Token
  - Stake-Menge (nach Token-Launch)

### Boost-System

Bestimmte Aktionen lösen temporäre Boosts der Mining-Rate aus:

| Aktion | Boost-Multiplikator | Dauer |
|--------|---------------------|-------|
| Post erstellen | 2.0x | 10 Minuten |
| Kommentar schreiben | 1.5x | 5 Minuten |
| Like geben | 1.2x | 2 Minuten |
| Teilen von Inhalten | 1.8x | 8 Minuten |
| Gruppenaktivität | 1.5x | 5 Minuten |
| Täglicher Login | 1.3x | 15 Minuten |
| Referral-Erfolg | 3.0x | 30 Minuten |

Boosts können sich stapeln, mit einer maximalen Gesamtrate (z.B. 5.0x).

### Tageslimit

- Jeder Nutzer hat ein tägliches Limit an minieerbaren Token (z.B. 10 BSN-Token pro Tag)
- Das Limit kann durch besondere Aktionen oder Status erhöht werden
- Das Limit wird täglich zurückgesetzt

### Belohnungsverteilung

- Pre-Launch: Nutzer erhalten "Pre-BSN-Token" als interne Währung
- Post-Launch: Echte BSN-Token werden auf die Blockchain-Wallet des Nutzers übertragen
- Claim-System: Nutzer können ihre verdienten Token in regelmäßigen Abständen beanspruchen

## Anti-Fraud-Maßnahmen

1. **Aktivitätsvalidierung**: Prüfung echter Nutzeraktivität vs. automatisierter Aktionen
2. **Inaktivitätserkennung**: Pausierung des Minings bei fehlender Interaktion
3. **Rate-Limiting**: Begrenzung der Anzahl von Aktionen in bestimmten Zeiträumen
4. **Muster-Erkennung**: Identifizierung verdächtiger Aktivitätsmuster
5. **IP/Device-Checks**: Verhinderung von Multi-Accounting
6. **Qualitätsprüfung**: Bewertung der Qualität von Beiträgen und Interaktionen

## Frontend-Integration

### MiningWidget

Ein persistentes Widget zeigt dem Nutzer:
- Aktuelle Mining-Rate
- Aktive Boosts und deren verbleibende Dauer
- Heute bereits geminete Token
- Verbleibendes Tageslimit
- Gesamtbilanz der Token

### Mining-Seite

Eine dedizierte Seite mit detaillierten Informationen:
- Mining-Statistiken und -Verlauf
- Verfügbare Boost-Aktionen
- Leaderboard der Top-Miner
- Claim-Button für verdiente Token
- Erklärungen zur Mining-Mechanik

## Backend-Implementierung

### Datenmodelle

```python
# Mining-Session
class MiningSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_heartbeat = models.DateTimeField(auto_now_add=True)
    
    # Mining-Statistiken für diese Session
    base_rate = models.DecimalField(max_digits=10, decimal_places=6)
    current_rate = models.DecimalField(max_digits=10, decimal_places=6)
    tokens_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)

# Boost-Typen
class BoostType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    multiplier = models.DecimalField(max_digits=5, decimal_places=2)
    duration_minutes = models.IntegerField()
    action_type = models.CharField(max_length=50)  # post, comment, like, etc.

# Aktive Boosts
class ActiveBoost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    boost_type = models.ForeignKey(BoostType, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)

# Tägliche Mining-Statistik
class DailyMiningStats(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    tokens_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    daily_limit = models.DecimalField(max_digits=18, decimal_places=8)
    remaining_limit = models.DecimalField(max_digits=18, decimal_places=8)
```

### API-Endpunkte

- `POST /api/mining/session/start/`: Startet eine Mining-Session
- `POST /api/mining/session/heartbeat/`: Aktualisiert den Heartbeat einer aktiven Session
- `POST /api/mining/session/stop/`: Beendet eine Mining-Session
- `GET /api/mining/status/`: Gibt den aktuellen Mining-Status zurück
- `GET /api/mining/boosts/`: Listet aktive Boosts auf
- `GET /api/mining/stats/daily/`: Gibt tägliche Mining-Statistiken zurück
- `GET /api/mining/stats/history/`: Gibt historische Mining-Daten zurück
- `GET /api/mining/leaderboard/`: Gibt das Leaderboard der Top-Miner zurück
- `POST /api/mining/claim/`: Beansprucht verdiente Token

## Integration mit anderen Systemen

### Wallet-Integration

- Verdiente Token werden im internen Wallet-System gutgeschrieben
- Nach dem Token-Launch können Token auf externe Wallets übertragen werden

### Notification-System

- Benachrichtigungen bei Boost-Aktivierung
- Erinnerungen bei inaktiver Mining-Session
- Hinweise bei Erreichen des Tageslimits
- Benachrichtigungen über erfolgreiche Claims

### Analytics

- Tracking der Mining-Aktivitäten für Plattform-Metriken
- Analyse der effektivsten Boost-Aktionen
- Überwachung der Token-Verteilung

## Zukünftige Erweiterungen

1. **Staking-Mechanismen**: Erhöhung der Mining-Rate durch Staking von Token
2. **NFT-Boosts**: Spezielle Boosts durch den Besitz bestimmter NFTs
3. **Aufgaben-System**: Zusätzliche Boosts durch Erfüllung bestimmter Aufgaben
4. **Community-Challenges**: Gemeinsame Mining-Ziele für die Community
5. **Governance-Integration**: Mining-Parameter durch DAO-Abstimmungen anpassbar
