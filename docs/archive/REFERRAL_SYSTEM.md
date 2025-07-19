# BSN Referral-System

## Überblick

Das Referral-System ist ein wichtiger Bestandteil des BSN (Blockchain Social Network) und dient dazu, das organische Wachstum der Plattform zu fördern. Es belohnt bestehende Nutzer für das Einladen neuer Mitglieder und bietet Anreize für beide Seiten.

## Grundprinzipien

1. **Einladungscode**: Jeder Nutzer erhält einen eindeutigen Referral-Code
2. **Belohnungssystem**: Belohnungen für erfolgreiche Einladungen
3. **Verifizierungsmechanismen**: Sicherstellung echter Nutzeraktivität
4. **Meilenstein-Boni**: Zusätzliche Belohnungen bei Erreichen bestimmter Einladungszahlen
5. **Anti-Fraud-Maßnahmen**: Verhinderung von Missbrauch des Systems

## Funktionsweise

### Referral-Code-Generierung

- Bei der Registrierung wird für jeden Nutzer automatisch ein eindeutiger Referral-Code generiert
- Der Code ist kurz und leicht zu merken (z.B. 8 alphanumerische Zeichen)
- Der Nutzer kann seinen Referral-Code und -Link im Dashboard einsehen

### Einladungsprozess

1. Der bestehende Nutzer (Referrer) teilt seinen Referral-Link oder -Code
2. Ein neuer Nutzer (Referee) registriert sich über den Link oder gibt den Code bei der Registrierung ein
3. Nach erfolgreicher Registrierung wird die Verbindung zwischen Referrer und Referee hergestellt
4. Die Belohnung wird erst nach Verifizierung der Aktivität des neuen Nutzers gutgeschrieben

### Belohnungssystem

| Aktion | Belohnung für Referrer | Belohnung für Referee |
|--------|------------------------|------------------------|
| Registrierung | 0.5 BSN-Token (vorläufig) | 0.2 BSN-Token (vorläufig) |
| E-Mail-Verifizierung | - | 0.3 BSN-Token zusätzlich |
| Erste Aktivitäten | 0.5 BSN-Token zusätzlich | - |

### Meilenstein-Boni

| Meilenstein | Zusätzliche Belohnung |
|-------------|------------------------|
| 5 erfolgreiche Referrals | 2.5 BSN-Token |
| 10 erfolgreiche Referrals | 5.0 BSN-Token |
| 25 erfolgreiche Referrals | 15.0 BSN-Token |
| 50 erfolgreiche Referrals | 35.0 BSN-Token |
| 100 erfolgreiche Referrals | 100.0 BSN-Token |

### Verifizierungsmechanismen

Um sicherzustellen, dass das Referral-System nicht missbraucht wird, werden folgende Verifizierungsmechanismen implementiert:

1. **E-Mail-Verifizierung**: Der neue Nutzer muss seine E-Mail-Adresse bestätigen
2. **Aktivitätsprüfung**: Der neue Nutzer muss bestimmte Aktivitäten auf der Plattform durchführen:
   - Mindestens 3 Logins an verschiedenen Tagen
   - Vervollständigung des Profils
   - Mindestens eine Faucet-Claim oder andere Plattform-Interaktion
3. **Zeitfenster**: Die Aktivitäten müssen innerhalb eines bestimmten Zeitraums (z.B. 14 Tage) erfolgen

## Anti-Fraud-Maßnahmen

1. **IP/Device-Tracking**: Erkennung von Multi-Accounting
2. **Aktivitätsanalyse**: Prüfung auf Bot-Verhalten oder unnatürliche Aktivitätsmuster
3. **Limits**: Begrenzung der Anzahl von Referrals pro Zeitraum
4. **Qualitätsprüfung**: Bewertung der Qualität der eingeladenen Nutzer
5. **Blacklisting**: Sperrung von Nutzern bei nachgewiesenem Betrug

## Frontend-Integration

### Referral-Widget

Ein Widget im Dashboard zeigt dem Nutzer:
- Seinen persönlichen Referral-Code und -Link
- Copy-to-Clipboard-Funktion für einfaches Teilen
- Anzahl erfolgreicher Referrals
- Verdiente Belohnungen durch Referrals
- Fortschritt zum nächsten Meilenstein

### Referral-Seite

Eine dedizierte Seite mit detaillierten Informationen:
- Statistiken zu Referrals (gesamt, verifiziert, ausstehend)
- Liste der eingeladenen Nutzer (anonymisiert)
- Sharing-Optionen für soziale Medien
- Erklärung des Referral-Systems und der Belohnungen
- Meilenstein-Übersicht

## Backend-Implementierung

### Datenmodelle

```python
# Referral-Code
class ReferralCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referral_code')
    code = models.CharField(max_length=16, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.code:
            # Generiere einen einzigartigen Code, wenn keiner vorhanden ist
            self.code = self._generate_unique_code()
        super().save(*args, **kwargs)
    
    def _generate_unique_code(self):
        # Implementierung der Code-Generierung
        import uuid
        return str(uuid.uuid4())[:8]
    
    def __str__(self):
        return f"{self.user.username}: {self.code}"

# Referral-Verbindung
class Referral(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    referrer = models.ForeignKey(User, related_name='referrals_made', on_delete=models.CASCADE)
    referee = models.ForeignKey(User, related_name='referred_by', on_delete=models.CASCADE)
    code_used = models.CharField(max_length=16)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reward_amount_referrer = models.DecimalField(max_digits=10, decimal_places=4, default=0.5)
    reward_amount_referee = models.DecimalField(max_digits=10, decimal_places=4, default=0.2)
    reward_paid_referrer = models.BooleanField(default=False)
    reward_paid_referee = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('referrer', 'referee')
    
    def __str__(self):
        return f"{self.referrer.username} referred {self.referee.username}"

# Referral-Aktivität
class ReferralActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('profile_complete', 'Profile Completed'),
        ('faucet_claim', 'Faucet Claim'),
        ('token_reserve', 'Token Reservation'),
        ('post', 'Post Created'),
        ('comment', 'Comment Created'),
    ]
    
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.referral.referee.username}: {self.activity_type} at {self.timestamp}"

# Referral-Meilenstein
class ReferralMilestone(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_milestones')
    milestone_level = models.IntegerField()  # 5, 10, 25, 50, 100
    reward_amount = models.DecimalField(max_digits=10, decimal_places=4)
    achieved_at = models.DateTimeField(auto_now_add=True)
    reward_paid = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'milestone_level')
    
    def __str__(self):
        return f"{self.user.username}: Level {self.milestone_level} at {self.achieved_at}"
```

### API-Endpunkte

- `GET /api/referral/code/`: Gibt den Referral-Code des Nutzers zurück
- `GET /api/referral/stats/`: Gibt Statistiken zu den Referrals des Nutzers zurück
- `GET /api/referral/list/`: Gibt eine Liste der Referrals des Nutzers zurück
- `GET /api/referral/milestones/`: Gibt die Meilensteine und den Fortschritt des Nutzers zurück
- `POST /api/referral/share/`: Sendet eine Einladungs-E-Mail an angegebene E-Mail-Adressen
- `GET /api/referral/validate/{code}/`: Validiert einen Referral-Code (für die Registrierungsseite)

## Integration mit anderen Systemen

### Registrierungs-Integration

- Feld für Referral-Code im Registrierungsformular
- Automatisches Ausfüllen, wenn über Referral-Link gekommen
- Validierung des Codes bei der Registrierung

### Wallet-Integration

- Gutschrift der Belohnungen im internen Wallet-System
- Anzeige der durch Referrals verdienten Token

### Notification-System

- Benachrichtigung bei erfolgreicher Referral-Registrierung
- Benachrichtigung bei Verifizierung und Belohnungsgutschrift
- Benachrichtigung bei Erreichen von Meilensteinen

### Mining-Integration

- Boost der Mining-Rate bei erfolgreicher Referral-Verifizierung
- Spezielle Mining-Boosts bei Erreichen von Meilensteinen

## Kampagnen und Sonderaktionen

Das Referral-System kann für spezielle Kampagnen und Aktionen angepasst werden:

1. **Zeitlich begrenzte Boosts**: Erhöhte Belohnungen für Referrals während bestimmter Zeiträume
2. **Thematische Kampagnen**: Spezielle Referral-Links für bestimmte Zielgruppen oder Anlässe
3. **Wettbewerbe**: Belohnungen für die Nutzer mit den meisten erfolgreichen Referrals in einem Zeitraum
4. **Community-Challenges**: Gemeinsame Ziele für die gesamte Community

## Tracking und Analytics

- Erfassung der Conversion-Rate von Referral-Links
- Analyse der Qualität von Referrals (Aktivität, Retention)
- Identifikation der effektivsten Sharing-Kanäle
- Überwachung der Belohnungsausschüttung

## Rechtliche Aspekte

- Transparente Kommunikation der Referral-Bedingungen
- Datenschutzkonforme Handhabung von Kontaktdaten
- Klare Regeln zu erlaubten und nicht erlaubten Werbemethoden
- Disclaimer bezüglich der Token-Belohnungen
