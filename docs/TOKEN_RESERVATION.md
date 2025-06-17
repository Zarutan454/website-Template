# BSN Token-Reservierungs-System

## Überblick

Das Token-Reservierungs-System ermöglicht es Nutzern, BSN-Token vor dem offiziellen Launch zu reservieren. Es handelt sich um eine Pre-Sale-Funktion, die frühen Unterstützern die Möglichkeit gibt, Token zu vorteilhaften Konditionen zu sichern, während das Projekt gleichzeitig Interesse und Kapital für die Entwicklung generieren kann.

## Grundprinzipien

1. **Reservierung vs. Kauf**: Nutzer reservieren Token, kaufen sie aber nicht direkt
2. **Phasen-System**: Verschiedene Phasen mit unterschiedlichen Preisen und Limits
3. **Whitelist-Mechanismus**: Priorisierter Zugang für aktive Community-Mitglieder
4. **Transparente Bedingungen**: Klare Kommunikation aller Konditionen und Risiken
5. **Compliance**: Einhaltung relevanter rechtlicher Anforderungen

## Funktionsweise

### Reservierungs-Prozess

1. Nutzer registriert sich und verifiziert seinen Account
2. Nutzer wählt die gewünschte Token-Menge innerhalb der Limits
3. System berechnet den entsprechenden Preis basierend auf der aktuellen Phase
4. Nutzer bestätigt die Reservierung und akzeptiert die Bedingungen
5. Reservierung wird im System gespeichert und dem Nutzer bestätigt
6. Bei Token-Launch erhält der Nutzer die Möglichkeit, die reservierten Token zu erwerben

### Phasen-System

| Phase | Zeitraum | Preis pro Token | Minimale Reservierung | Maximale Reservierung | Besonderheiten |
|-------|----------|-----------------|----------------------|----------------------|----------------|
| Seed | Monat 1-2 | 0.10 USD | 100 BSN | 10,000 BSN | Nur für Whitelist |
| Private | Monat 3-4 | 0.15 USD | 50 BSN | 5,000 BSN | Whitelist-Priorität |
| Early | Monat 5-6 | 0.20 USD | 20 BSN | 2,000 BSN | Für alle verfügbar |
| Public | Monat 7-8 | 0.25 USD | 10 BSN | 1,000 BSN | Für alle verfügbar |

### Whitelist-Mechanismus

Nutzer können sich für die Whitelist qualifizieren durch:
- Frühe Registrierung und aktive Teilnahme
- Erfolgreiche Referrals (mindestens 5)
- Regelmäßige Faucet-Claims (mindestens 14 Tage)
- Beiträge zur Community (Content, Feedback, etc.)
- Teilnahme an Community-Events und -Aufgaben

## Rechtliche und Compliance-Aspekte

### Disclaimer und Bedingungen

Bei jeder Reservierung muss der Nutzer folgende Bedingungen akzeptieren:
- Die Reservierung stellt keinen Kauf dar, sondern eine unverbindliche Absichtserklärung
- Es besteht keine Garantie für den zukünftigen Wert der Token
- Das Projekt behält sich das Recht vor, Bedingungen anzupassen oder die Tokenisierung zu ändern
- Der Nutzer bestätigt, dass er nicht in Ländern ansässig ist, in denen Token-Sales verboten sind
- Der Nutzer bestätigt, dass er die Token nicht zu Spekulationszwecken erwirbt

### Geografische Einschränkungen

Das System implementiert geografische Beschränkungen basierend auf:
- IP-Adresse
- Selbstdeklaration des Nutzers
- KYC-Verifikation (in späteren Phasen)

### KYC-Integration (Know Your Customer)

- Für Reservierungen über bestimmten Schwellenwerten (z.B. 10,000,000 USD)
- Stufenweise Implementierung je nach Phase
- Integration mit externen KYC-Dienstleistern
- Sichere Speicherung und Verarbeitung der Daten

## Frontend-Integration

### Token-Reservierungs-Widget

Ein Widget auf dem Dashboard zeigt dem Nutzer:
- Aktuelle Phase und Konditionen
- Persönliche Reservierungslimits
- Bereits reservierte Token
- Whitelist-Status

### Reservierungs-Seite

Eine dedizierte Seite mit detaillierten Informationen:
- Ausführliche Erklärung des Reservierungsprozesses
- Formular zur Durchführung einer Reservierung
- Übersicht aller Phasen und Konditionen
- FAQ zum Token-Sale
- Rechtliche Hinweise und Bedingungen

## Backend-Implementierung

### Datenmodelle

```python
# Token-Reservierung
class TokenReservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='token_reservations')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    price_per_token = models.DecimalField(max_digits=10, decimal_places=4)
    total_value_usd = models.DecimalField(max_digits=10, decimal_places=2)
    phase = models.CharField(max_length=20)  # seed, private, early, public
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)
    
    # Tracking-Informationen
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    country_code = models.CharField(max_length=3, null=True, blank=True)
    
    # Rechtliche Bestätigungen
    terms_accepted = models.BooleanField(default=False)
    not_us_citizen = models.BooleanField(default=False)
    not_restricted_country = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.amount} BSN at {self.price_per_token} USD"

# Whitelist-Eintrag
class Whitelist(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='whitelist')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    application_date = models.DateTimeField(auto_now_add=True)
    review_date = models.DateTimeField(null=True, blank=True)
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    notes = models.TextField(null=True, blank=True)
    
    # Qualifikationskriterien
    registration_date = models.DateTimeField()
    days_active = models.IntegerField(default=0)
    faucet_claims = models.IntegerField(default=0)
    successful_referrals = models.IntegerField(default=0)
    community_contributions = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}: {self.status}"

# Sale-Phase-Konfiguration
class SalePhaseConfiguration(models.Model):
    phase_name = models.CharField(max_length=20, unique=True)  # seed, private, early, public
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    price_per_token = models.DecimalField(max_digits=10, decimal_places=4)
    min_reservation = models.DecimalField(max_digits=18, decimal_places=8)
    max_reservation = models.DecimalField(max_digits=18, decimal_places=8)
    total_allocation = models.DecimalField(max_digits=18, decimal_places=8)
    remaining_allocation = models.DecimalField(max_digits=18, decimal_places=8)
    whitelist_only = models.BooleanField(default=False)
    kyc_required = models.BooleanField(default=False)
    kyc_threshold_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.phase_name}: {self.price_per_token} USD ({self.start_date} - {self.end_date})"
```

### API-Endpunkte

- `POST /api/token/reserve/`: Erstellt eine neue Token-Reservierung
- `GET /api/token/reservations/`: Gibt die Reservierungen des Nutzers zurück
- `GET /api/token/phase/`: Gibt Informationen zur aktuellen Sale-Phase zurück
- `GET /api/token/whitelist/status/`: Gibt den Whitelist-Status des Nutzers zurück
- `POST /api/token/whitelist/apply/`: Bewirbt sich für die Whitelist
- `GET /api/token/stats/`: Gibt Statistiken zum Token-Sale zurück (Gesamtreservierungen, etc.)

## Integration mit anderen Systemen

### Wallet-Integration

- Anzeige der reservierten Token im Wallet-Bereich
- Vorbereitung für die spätere Tokenisierung

### Notification-System

- Benachrichtigung bei Änderungen der Sale-Phase
- Bestätigung nach erfolgreicher Reservierung
- Erinnerungen vor Ende einer Phase
- Updates zum Status der Whitelist-Bewerbung

### Referral-Integration

- Bonus-Reservierungslimits für erfolgreiche Referrals
- Whitelist-Priorisierung für aktive Referrer

### KYC-Prozess

- Nahtlose Integration des KYC-Prozesses für größere Reservierungen
- Statusverfolgung und Benachrichtigungen zum KYC-Fortschritt

## Administration

### Admin-Panel

- Übersicht aller Reservierungen
- Verwaltung der Sale-Phasen und deren Parameter
- Whitelist-Management und -Genehmigung
- Exportfunktionen für Berichte und Compliance

### Monitoring

- Echtzeit-Überwachung der Reservierungsaktivitäten
- Anomalie-Erkennung für verdächtige Muster
- Tracking des verbleibenden Allocations pro Phase

## Sicherheitsmaßnahmen

1. **Reservierungslimits**: Begrenzung der maximalen Reservierungsmenge pro Nutzer
2. **IP-Tracking**: Erkennung von Multi-Accounting
3. **Aktivitätsanalyse**: Prüfung auf Bot-Verhalten oder unnatürliche Aktivitätsmuster
4. **Manuelle Überprüfung**: Stichprobenartige Überprüfung von großen Reservierungen
5. **Zwei-Faktor-Authentifizierung**: Für Reservierungen über bestimmten Schwellenwerten

## Kommunikation und Transparenz

- Regelmäßige Updates zum Status des Token-Sales
- Transparente Kommunikation über verkaufte Token und verbleibende Allocation
- Klare Timeline für den Token-Launch und die Tokenisierung der Reservierungen
- Offene Kommunikation über die Verwendung der generierten Mittel

## Post-Sale-Prozess

1. **Bestätigung**: Vor dem Token-Launch werden Reservierungen bestätigt
2. **Zahlungsabwicklung**: Implementierung sicherer Zahlungsmethoden
3. **Token-Zuteilung**: Automatisierte Zuteilung der Token nach erfolgter Zahlung
4. **Vesting**: Implementierung von Vesting-Perioden je nach Sale-Phase
