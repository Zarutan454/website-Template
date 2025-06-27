# BSN Mining-System Entwicklungsregeln

## ⛏️ Mining-Phasen-Logik (KRITISCH)

### Phase-basierte Mining-Aktivierung
```python
MINING_PHASES = {
    "alpha": {
        "user_range": "0-10k",
        "mining_enabled": False,  # NIEMALS echtes Mining!
        "simulation_only": True,
        "tokens": "Faucet/Simulation only"
    },
    "beta": {
        "user_range": "10k-100k", 
        "mining_enabled": False,  # NIEMALS echtes Mining!
        "simulation_only": True,
        "tokens": "Faucet/Simulation only"
    },
    "launch": {
        "user_range": "100k-5M",
        "mining_enabled": True,   # Erst hier echtes Mining!
        "real_tokens": True,
        "blockchain": "Multi-Chain via LayerZero"
    },
    "enterprise": {
        "user_range": "5M+",
        "mining_enabled": True,
        "own_blockchain": True
    }
}
```

### ⚠️ KRITISCHE MINING-REGELN

#### NIEMALS tun (Mining):
1. **NIEMALS** echte BSN-Token vor 100.000 Nutzern ausgeben
2. **NIEMALS** Mining-System ohne Phase-Check aktivieren
3. **NIEMALS** unbegrenzte Token-Ausgabe ermöglichen
4. **NIEMALS** Mining ohne Anti-Fraud-Checks
5. **NIEMALS** Tageslimits umgehen oder ignorieren

#### IMMER tun (Mining):
1. **IMMER** aktuelle Phase vor Mining-Operationen prüfen
2. **IMMER** Tageslimits einhalten (max. 10 BSN/Tag)
3. **IMMER** Heartbeat-System für Session-Management
4. **IMMER** Anti-Fraud-Validierung vor Token-Ausgabe
5. **IMMER** Mining-Transaktionen in DB loggen

## 🔧 Mining-System Implementierung

### Django Models (Verpflichtend)
```python
class MiningSession(models.Model):
    """Mining-Session-Management mit strikten Phase-Checks."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_heartbeat = models.DateTimeField(auto_now_add=True)
    
    # Phase-Information (KRITISCH)
    mining_phase = models.CharField(max_length=20, choices=[
        ('alpha', 'Alpha Phase'),
        ('beta', 'Beta Phase'), 
        ('launch', 'Launch Phase'),
        ('enterprise', 'Enterprise Phase')
    ])
    
    # Mining-Rates
    base_rate = models.DecimalField(max_digits=10, decimal_places=6, default=0.01)
    current_rate = models.DecimalField(max_digits=10, decimal_places=6, default=0.01)
    
    # Token-Tracking
    tokens_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    is_simulation = models.BooleanField(default=True)  # Nur false ab Launch-Phase
    
    # Anti-Fraud
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    suspicious_activity = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        # KRITISCH: Phase-basierte Validierung
        current_phase = get_current_mining_phase()
        self.mining_phase = current_phase
        
        if current_phase in ['alpha', 'beta']:
            self.is_simulation = True
            
        super().save(*args, **kwargs)
    
    def can_mine(self):
        """Prüft ob Mining für aktuellen User/Phase erlaubt ist."""
        current_phase = get_current_mining_phase()
        
        # KRITISCH: Kein echtes Mining vor Launch-Phase
        if current_phase in ['alpha', 'beta']:
            return False
            
        # Tägliche Limits prüfen
        if self.user.get_daily_mining_amount() >= settings.DAILY_MINING_LIMIT:
            return False
            
        # Anti-Fraud-Checks
        if self.suspicious_activity or not self.user.is_mining_eligible():
            return False
            
        return True

class MiningTransaction(models.Model):
    """Alle Mining-Transaktionen mit striktem Logging."""
    
    TRANSACTION_TYPES = [
        ('passive', 'Passive Mining'),
        ('post_boost', 'Post Creation Boost'),
        ('comment_boost', 'Comment Boost'),
        ('group_boost', 'Group Join Boost'),
        ('referral_bonus', 'Referral Bonus'),
        ('daily_claim', 'Daily Claim'),
        ('simulation', 'Simulation (Pre-Launch)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(MiningSession, on_delete=models.CASCADE, null=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    
    # Phase-Information (KRITISCH für Audit)
    mining_phase = models.CharField(max_length=20)
    is_simulation = models.BooleanField(default=True)
    
    # Anti-Fraud-Metadaten
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_fingerprint = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['mining_phase', 'is_simulation']),
            models.Index(fields=['transaction_type', 'created_at']),
        ]
    
    def save(self, *args, **kwargs):
        # KRITISCH: Phase-Check bei jeder Transaktion
        current_phase = get_current_mining_phase()
        self.mining_phase = current_phase
        
        if current_phase in ['alpha', 'beta']:
            self.is_simulation = True
            
        super().save(*args, **kwargs)

class DailyMiningStats(models.Model):
    """Tägliche Mining-Statistiken mit strikten Limits."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    
    # Mining-Amounts
    tokens_mined = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    daily_limit = models.DecimalField(max_digits=18, decimal_places=8, default=10)
    remaining_limit = models.DecimalField(max_digits=18, decimal_places=8, default=10)
    
    # Phase-Information
    mining_phase = models.CharField(max_length=20)
    is_simulation = models.BooleanField(default=True)
    
    # Boost-Tracking
    active_boosts = models.JSONField(default=list)
    total_boost_time = models.IntegerField(default=0)  # Minuten
    
    class Meta:
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['date', 'mining_phase']),
            models.Index(fields=['user', 'date']),
        ]
```

### Mining API Views (Mit Phase-Checks)
```python
class MiningDashboardView(LoginRequiredMixin, View):
    """Mining Dashboard mit strikten Phase-Checks."""
    
    def get(self, request):
        try:
            user = request.user
            current_phase = get_current_mining_phase()
            
            # KRITISCH: Phase-Check zuerst
            if current_phase in ['alpha', 'beta']:
                return JsonResponse({
                    'mining_enabled': False,
                    'phase': current_phase,
                    'simulation_mode': True,
                    'message': f'Mining wird bei 100k Nutzern aktiviert. Aktuelle Phase: {current_phase}',
                    'user_count': User.objects.count(),
                    'launch_threshold': 100000
                })
            
            # Mining-Daten für Launch/Enterprise Phase
            daily_stats = get_or_create_daily_stats(user)
            active_session = get_active_mining_session(user)
            
            return JsonResponse({
                'mining_enabled': True,
                'phase': current_phase,
                'simulation_mode': False,
                'data': {
                    'balance': float(user.mining_balance),
                    'daily_mined': float(daily_stats.tokens_mined),
                    'daily_limit': float(daily_stats.daily_limit),
                    'remaining_limit': float(daily_stats.remaining_limit),
                    'mining_active': active_session.is_active if active_session else False,
                    'current_rate': float(user.get_current_mining_rate()),
                    'active_boosts': get_active_boosts(user)
                }
            })
            
        except Exception as e:
            logger.error(f"Mining dashboard error: {str(e)}")
            return JsonResponse({'error': 'Failed to load mining dashboard'}, status=500)
    
    def post(self, request):
        """Mining-Aktionen mit strikter Validierung."""
        try:
            action = request.POST.get('action')
            user = request.user
            current_phase = get_current_mining_phase()
            
            # KRITISCH: Kein Mining in Alpha/Beta
            if current_phase in ['alpha', 'beta']:
                return JsonResponse({
                    'success': False,
                    'error': f'Mining nicht verfügbar in {current_phase} Phase',
                    'simulation_mode': True
                }, status=400)
            
            if action == 'start_mining':
                return self._start_mining(user)
            elif action == 'claim_rewards':
                return self._claim_rewards(user)
            elif action == 'stop_mining':
                return self._stop_mining(user)
            else:
                return JsonResponse({'success': False, 'error': 'Invalid action'}, status=400)
                
        except Exception as e:
            logger.error(f"Mining action error: {str(e)}")
            return JsonResponse({'success': False, 'error': 'Action failed'}, status=500)
    
    def _start_mining(self, user):
        """Startet Mining mit allen Validierungen."""
        # Anti-Fraud-Checks
        if not validate_mining_request(user, self.request):
            return JsonResponse({
                'success': False,
                'error': 'Mining request validation failed'
            }, status=400)
        
        # Tägliche Limits prüfen
        daily_stats = get_or_create_daily_stats(user)
        if daily_stats.remaining_limit <= 0:
            return JsonResponse({
                'success': False,
                'error': 'Daily mining limit reached'
            }, status=400)
        
        # Mining-Session erstellen
        session = MiningSession.objects.create(
            user=user,
            ip_address=get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            is_simulation=False  # Nur in Launch+ Phase
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Mining started successfully',
            'session_id': session.id
        })
```

### Mining Utilities (Kritische Funktionen)
```python
def get_current_mining_phase():
    """Bestimmt aktuelle Mining-Phase basierend auf Nutzerzahl."""
    try:
        total_users = User.objects.filter(is_active=True).count()
        
        if total_users < 10000:
            return 'alpha'
        elif total_users < 100000:
            return 'beta'
        elif total_users < 5000000:
            return 'launch'
        else:
            return 'enterprise'
            
    except Exception as e:
        logger.error(f"Failed to get mining phase: {str(e)}")
        return 'alpha'  # Safe default

def validate_mining_request(user, request):
    """Anti-Fraud-Validierung für Mining-Requests."""
    
    # IP-Check
    ip = get_client_ip(request)
    recent_requests = MiningTransaction.objects.filter(
        ip_address=ip,
        created_at__gte=timezone.now() - timedelta(hours=1)
    ).count()
    
    if recent_requests > 60:  # Max 1 Request pro Minute
        logger.warning(f"Suspicious mining activity from IP {ip}")
        return False
    
    # User-Activity-Check
    if not user.has_recent_activity():
        return False
    
    # Device-Check (einfach)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    if len(user_agent) < 10:  # Zu kurzer User-Agent verdächtig
        return False
    
    return True

def calculate_mining_boost(user, activity_type):
    """Berechnet Mining-Boost für Aktivitäten."""
    
    # KRITISCH: Nur in Launch+ Phase
    current_phase = get_current_mining_phase()
    if current_phase in ['alpha', 'beta']:
        return {'multiplier': 1.0, 'duration': 0, 'simulation': True}
    
    boost_config = {
        'post': {'multiplier': 2.0, 'duration': 10},      # +100% für 10 Min
        'comment': {'multiplier': 1.5, 'duration': 5},    # +50% für 5 Min  
        'like': {'multiplier': 1.2, 'duration': 2},       # +20% für 2 Min
        'group_join': {'multiplier': 2.0, 'duration': 60}, # +100% für 1h
        'referral': {'multiplier': 3.0, 'duration': 1440}, # +200% für 24h
    }
    
    if activity_type not in boost_config:
        return {'multiplier': 1.0, 'duration': 0}
    
    config = boost_config[activity_type]
    
    return {
        'multiplier': config['multiplier'],
        'duration': config['duration'],
        'expires_at': timezone.now() + timedelta(minutes=config['duration']),
        'simulation': False
    }

def process_mining_reward(user, amount, transaction_type='passive'):
    """Verarbeitet Mining-Belohnung mit allen Checks."""
    
    current_phase = get_current_mining_phase()
    
    # KRITISCH: Phase-Check
    if current_phase in ['alpha', 'beta']:
        # Nur Simulation in frühen Phasen
        return create_simulation_transaction(user, amount, transaction_type)
    
    # Echte Token-Ausgabe nur ab Launch-Phase
    daily_stats = get_or_create_daily_stats(user)
    
    # Tägliche Limits prüfen
    if daily_stats.remaining_limit < amount:
        amount = daily_stats.remaining_limit
    
    if amount <= 0:
        return None
    
    # Mining-Transaktion erstellen
    transaction = MiningTransaction.objects.create(
        user=user,
        transaction_type=transaction_type,
        amount=amount,
        mining_phase=current_phase,
        is_simulation=False,
        ip_address=get_current_ip(),
        user_agent=get_current_user_agent()
    )
    
    # User-Balance und Daily-Stats aktualisieren
    user.mining_balance += amount
    user.save()
    
    daily_stats.tokens_mined += amount
    daily_stats.remaining_limit -= amount
    daily_stats.save()
    
    return transaction

def create_simulation_transaction(user, amount, transaction_type):
    """Erstellt Simulations-Transaktion für Alpha/Beta-Phase."""
    
    return MiningTransaction.objects.create(
        user=user,
        transaction_type='simulation',
        amount=amount,
        mining_phase=get_current_mining_phase(),
        is_simulation=True,
        ip_address=get_current_ip(),
        user_agent=get_current_user_agent()
    )
```

## 📊 Frontend Mining Rules

### React Mining Component Rules
```jsx
// ✅ RICHTIG - Mining-Komponente mit Phase-Awareness
const MiningDashboard = () => {
  const [miningData, setMiningData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchMiningData()
  }, [])
  
  const fetchMiningData = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.mining.getStatus()
      setMiningData(response.data)
      
      // KRITISCH: Phase-basierte UI-Behandlung
      if (response.data.phase === 'alpha' || response.data.phase === 'beta') {
        // Zeige Simulation-UI für frühe Phasen
        setSimulationMode(true)
      }
      
    } catch (err) {
      setError('Failed to load mining data')
      console.error('Mining data error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // KRITISCH: Kein Mining-Start in Alpha/Beta
  const handleStartMining = async () => {
    if (miningData?.phase === 'alpha' || miningData?.phase === 'beta') {
      showToast('Mining wird bei 100k Nutzern aktiviert', 'info')
      return
    }
    
    try {
      await apiService.mining.start()
      showToast('Mining gestartet!', 'success')
      fetchMiningData() // Refresh data
    } catch (err) {
      showToast('Mining-Start fehlgeschlagen', 'error')
    }
  }
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  // Phase-basierte Rendering
  if (miningData?.phase === 'alpha' || miningData?.phase === 'beta') {
    return <MiningSimulationUI data={miningData} />
  }
  
  return <MiningActiveUI data={miningData} onStart={handleStartMining} />
}

// ✅ RICHTIG - Simulation-UI für frühe Phasen
const MiningSimulationUI = ({ data }) => (
  <Card className="mining-simulation">
    <div className="phase-banner bg-orange-500 p-3 text-white">
      <AlertTriangle className="inline mr-2" />
      Simulation Mode: {data.phase.toUpperCase()} Phase
    </div>
    
    <div className="p-6">
      <h3>Mining wird bald aktiviert!</h3>
      <p>Echtes Mining startet bei 100.000 Nutzern</p>
      
      <div className="progress-bar">
        <div className="progress" style={{
          width: `${(data.user_count / 100000) * 100}%`
        }} />
      </div>
      
      <div className="stats">
        <span>Aktuelle Nutzer: {data.user_count.toLocaleString()}</span>
        <span>Ziel: 100.000</span>
      </div>
      
      <Button disabled className="mt-4">
        Mining startet bei 100k Nutzern
      </Button>
    </div>
  </Card>
)

// ❌ FALSCH - Mining ohne Phase-Check
const BadMiningComponent = () => {
  const startMining = () => {
    // GEFAHR: Kein Phase-Check!
    apiService.mining.start()
  }
  
  return <Button onClick={startMining}>Start Mining</Button>
}
```

## ⚠️ Mining-System DON'Ts

### NIEMALS in Mining-Code:
```python
# ❌ NIEMALS - Mining ohne Phase-Check
def start_mining(user):
    create_mining_session(user)  # GEFÄHRLICH!

# ❌ NIEMALS - Unbegrenzte Token-Ausgabe
def mine_tokens(user, amount):
    user.balance += amount  # Ohne Limits!

# ❌ NIEMALS - Mining ohne Anti-Fraud
def process_mining():
    # Keine Validierung = Missbrauch möglich
    pass

# ❌ NIEMALS - Hardcoded Mining-Limits
DAILY_LIMIT = 10  # Use settings or database!

# ❌ NIEMALS - Mining-Daten ohne Logging
def claim_rewards(user):
    user.balance += rewards
    # Keine Transaktion-Logs = Audit-Problem
```

## ✅ Mining Development Checklist

Vor jedem Mining-Feature-Commit:
- [ ] Phase-Check implementiert (Alpha/Beta = kein echtes Mining)
- [ ] Tägliche Limits eingehalten (max. 10 BSN/Tag)
- [ ] Anti-Fraud-Validierung aktiv
- [ ] Alle Mining-Transaktionen geloggt
- [ ] IP/Device-Tracking implementiert
- [ ] Heartbeat-System für Sessions
- [ ] Error-Handling für alle Mining-API-Calls
- [ ] Simulation-Mode für Alpha/Beta-Phase
- [ ] Rate-Limiting für Mining-Endpoints
- [ ] Unit-Tests für Mining-Logik

**Diese Mining-Regeln sind KRITISCH und müssen strikt befolgt werden!** 