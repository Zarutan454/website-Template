# BSN Faucet-System

## Überblick

Das Faucet-System ist ein zentraler Bestandteil des BSN (Blockchain Social Network) in der Pre-Launch-Phase und ermöglicht es Nutzern, regelmäßig eine begrenzte Menge an BSN-Token zu beanspruchen. Es dient als Engagement-Mechanismus und als Möglichkeit für frühe Nutzer, Token zu sammeln, bevor der offizielle Token-Launch stattfindet.

## Grundprinzipien

1. **Regelmäßige Claims**: Nutzer können in festgelegten Zeitintervallen Token beanspruchen
2. **Begrenzte Menge**: Jeder Claim gewährt eine festgelegte Menge an Token
3. **Aktivitätsanforderungen**: Claims können an bestimmte Aktivitäten gebunden sein
4. **Anti-Fraud-Maßnahmen**: Verhinderung von Missbrauch und Bot-Aktivitäten
5. **Skalierbare Belohnungen**: Belohnungen können basierend auf Nutzeraktivität oder -status variieren

## Funktionsweise

### Claim-Mechanik

- Jeder registrierte und verifizierte Nutzer kann regelmäßig Token beanspruchen
- Standard-Intervall: Alle 24 Stunden (konfigurierbar)
- Standard-Menge: 1.0 BSN-Token pro Claim (konfigurierbar)
- Claim-Prozess erfordert eine aktive Handlung des Nutzers (Button-Klick)

### Claim-Typen

| Claim-Typ | Beschreibung | Intervall | Belohnungsmenge |
|-----------|-------------|-----------|-----------------|
| Standard | Basis-Claim für alle Nutzer | 24 Stunden | 1.0 BSN-Token |
| Aktivitäts-Boost | Für aktive Nutzer mit regelmäßigen Logins | 24 Stunden | 1.5 BSN-Token |
| Wöchentlicher Bonus | Zusätzlicher Claim nach 7 Tagen Aktivität | 7 Tage | 5.0 BSN-Token |
| Referral-Bonus | Zusätzlicher Claim nach erfolgreicher Referral | Nach Verifizierung | 2.0 BSN-Token |
| Community-Bonus | Für Beiträge zur Community (nach Moderation) | Nach Genehmigung | 3.0 BSN-Token |

### Aktivitätsanforderungen

Für bestimmte Claim-Typen können Aktivitätsanforderungen definiert werden:

1. **Aktivitäts-Boost**:
   - Mindestens 3 Logins in den letzten 7 Tagen
   - Mindestens eine Interaktion (Kommentar, Like, etc.) in den letzten 3 Tagen

2. **Wöchentlicher Bonus**:
   - 7 aufeinanderfolgende Tage mit mindestens einem Login
   - Mindestens 5 Interaktionen in der Woche

3. **Community-Bonus**:
   - Qualitativ hochwertige Beiträge (Posts, Kommentare)
   - Hilfe für andere Community-Mitglieder
   - Meldung von Bugs oder Verbesserungsvorschläge

## Anti-Fraud-Maßnahmen

1. **Verifizierte Accounts**: Nur verifizierte Nutzer können Claims durchführen
2. **Captcha/Proof-of-Human**: Bei jedem Claim wird eine Mensch-Verifizierung durchgeführt
3. **IP/Device-Tracking**: Erkennung von Multi-Accounting
4. **Rate-Limiting**: Strenge Begrenzung der Claim-Versuche
5. **Aktivitätsanalyse**: Prüfung auf natürliche Nutzeraktivität
6. **Manuelle Überprüfung**: Stichprobenartige Überprüfung von Accounts mit hoher Claim-Rate

## Frontend-Integration

### Faucet-Widget

Ein Widget auf dem Dashboard zeigt dem Nutzer:
- Aktuellen Status des Faucet (verfügbar/nicht verfügbar)
- Countdown bis zum nächsten verfügbaren Claim
- Claim-Button (aktiv/inaktiv)
- Claim-Historie der letzten 7 Tage
- Gesamtmenge der beanspruchten Token

### Faucet-Seite

Eine dedizierte Seite mit detaillierten Informationen:
- Erklärung des Faucet-Systems
- Claim-Button mit aktuellem Status
- Übersicht aller Claim-Typen und deren Anforderungen
- Komplette Claim-Historie
- Statistiken zu Claims (Durchschnitt, Gesamt, Streak)
- Tipps zur Maximierung der Faucet-Belohnungen

## Backend-Implementierung

### Datenmodelle

```python
# Faucet-Claim
class FaucetClaim(models.Model):
    CLAIM_TYPES = [
        ('standard', 'Standard Claim'),
        ('activity_boost', 'Activity Boost'),
        ('weekly_bonus', 'Weekly Bonus'),
        ('referral_bonus', 'Referral Bonus'),
        ('community_bonus', 'Community Bonus'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='faucet_claims')
    claim_type = models.CharField(max_length=20, choices=CLAIM_TYPES, default='standard')
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username}: {self.claim_type} - {self.amount} BSN at {self.timestamp}"

# Faucet-Einstellungen pro Nutzer
class FaucetSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faucet_settings')
    next_standard_claim = models.DateTimeField()
    next_weekly_claim = models.DateTimeField()
    consecutive_days = models.IntegerField(default=0)
    last_active_date = models.DateField()
    total_claimed = models.DecimalField(max_digits=15, decimal_places=4, default=0)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}: Next claim at {self.next_standard_claim}"

# Faucet-Aktivität
class FaucetActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('interaction', 'Platform Interaction'),
        ('profile_update', 'Profile Update'),
        ('referral', 'Referral'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='faucet_activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username}: {self.activity_type} at {self.timestamp}"

# Faucet-Konfiguration (global)
class FaucetConfiguration(models.Model):
    standard_amount = models.DecimalField(max_digits=10, decimal_places=4, default=1.0)
    activity_boost_amount = models.DecimalField(max_digits=10, decimal_places=4, default=1.5)
    weekly_bonus_amount = models.DecimalField(max_digits=10, decimal_places=4, default=5.0)
    referral_bonus_amount = models.DecimalField(max_digits=10, decimal_places=4, default=2.0)
    community_bonus_amount = models.DecimalField(max_digits=10, decimal_places=4, default=3.0)
    
    standard_interval_hours = models.IntegerField(default=24)
    weekly_interval_days = models.IntegerField(default=7)
    
    captcha_required = models.BooleanField(default=True)
    max_claims_per_day = models.IntegerField(default=1)
    max_claims_per_week = models.IntegerField(default=7)
    
    is_active = models.BooleanField(default=True)
    maintenance_message = models.TextField(null=True, blank=True)
    
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    
    def __str__(self):
        return f"Faucet Config (Last updated: {self.last_updated})"
```

### API-Endpunkte

- `POST /api/faucet/claim/`: Führt einen Faucet-Claim durch
- `GET /api/faucet/status/`: Gibt den aktuellen Status des Faucets für den Nutzer zurück
- `GET /api/faucet/history/`: Gibt die Claim-Historie des Nutzers zurück
- `GET /api/faucet/config/`: Gibt die aktuellen Faucet-Konfigurationen zurück
- `GET /api/faucet/stats/`: Gibt Statistiken zu den Claims des Nutzers zurück

## Integration mit anderen Systemen

### Wallet-Integration

- Gutschrift der Faucet-Belohnungen im internen Wallet-System
- Anzeige der durch Faucet-Claims verdienten Token

### Notification-System

- Benachrichtigung, wenn ein Claim verfügbar ist
- Bestätigung nach erfolgreichem Claim
- Erinnerung bei verpassten Claims
- Hinweise zu Aktivitätsanforderungen für Boosts

### Referral-Integration

- Bonus-Claims für erfolgreiche Referrals
- Spezielle Faucet-Belohnungen für Nutzer mit vielen erfolgreichen Referrals

### Mining-Integration

- Faucet-Claims können Mining-Boosts aktivieren
- Konsistente Faucet-Nutzung erhöht die Basis-Mining-Rate

## Administration

### Admin-Panel

- Übersicht aller Claims (mit Filtermöglichkeiten)
- Statistiken zur Faucet-Nutzung
- Konfiguration der Claim-Typen und -Beträge
- Manuelle Vergabe von Bonus-Claims
- Sperren/Entsperren von Nutzern für das Faucet

### Monitoring

- Echtzeit-Überwachung der Claim-Aktivitäten
- Anomalie-Erkennung für verdächtige Muster
- Reporting zu Faucet-Nutzung und -Kosten

## Skalierung und Anpassung

Das Faucet-System ist so konzipiert, dass es sich leicht an verschiedene Phasen des Projekts anpassen lässt:

1. **Alpha-Phase**: Großzügigere Belohnungen, weniger strenge Anforderungen
2. **Beta-Phase**: Ausgewogenere Belohnungen, mehr Fokus auf Aktivität
3. **Pre-Launch**: Anpassung an die Tokenomics des bevorstehenden Launches
4. **Post-Launch**: Umstellung auf echte Token mit strengeren Limits

## Rechtliche Aspekte

- Klare Kommunikation, dass Faucet-Token keinen garantierten Wert haben
- Transparente Regeln zur Faucet-Nutzung
- Vorbehalt des Rechts, Faucet-Belohnungen anzupassen
- Hinweis, dass missbräuchliche Nutzung zum Ausschluss führen kann
