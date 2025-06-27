# BSN Coding Standards für Cursor

## 📝 Allgemeine Coding-Regeln

### Code-Qualität Standards
- **Lesbarkeit**: Code muss selbsterklärend sein
- **Konsistenz**: Einheitliche Namenskonventionen
- **Modularität**: Kleine, fokussierte Funktionen/Komponenten
- **Testbarkeit**: Jede Funktion muss testbar sein
- **Performance**: Optimierte Algorithmen und Datenstrukturen

## 🎯 JavaScript/React Coding Rules

### Funktions-Definition Rules
```javascript
// ✅ RICHTIG - Arrow Functions für einfache Funktionen
const calculateMiningReward = (activity, timeSpent) => {
  return activity * timeSpent * MINING_RATE
}

// ✅ RICHTIG - Named Functions für komplexe Logik
function validateUserRegistration(userData) {
  const errors = []
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Invalid email address')
  }
  
  if (!userData.password || userData.password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  return { isValid: errors.length === 0, errors }
}

// ❌ FALSCH - Unklare Funktionsnamen
const doStuff = () => {}
const handleClick = () => {} // Zu generisch
```

### Variable Naming Rules
```javascript
// ✅ RICHTIG - Beschreibende Namen
const userMiningBalance = 150.75
const isUserAuthenticated = true
const maxDailyMiningLimit = 10
const BSN_TOKEN_DECIMALS = 18

// ✅ RICHTIG - Konstanten in UPPER_CASE
const MINING_PHASES = {
  ALPHA: 'alpha',
  BETA: 'beta', 
  LAUNCH: 'launch',
  ENTERPRISE: 'enterprise'
}

// ❌ FALSCH - Unklare oder zu kurze Namen
const bal = 150.75
const user = true
const max = 10
const d = 18
```

### React Component Rules
```jsx
// ✅ RICHTIG - Functional Components mit Hooks
const MiningDashboard = ({ userId, initialBalance = 0 }) => {
  const [miningActive, setMiningActive] = useState(false)
  const [balance, setBalance] = useState(initialBalance)
  const { isLoading, error } = useMining(userId)
  
  const handleStartMining = useCallback(async () => {
    try {
      setMiningActive(true)
      await startMining(userId)
    } catch (err) {
      console.error('Mining start failed:', err)
      setMiningActive(false)
    }
  }, [userId])
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div className="mining-dashboard">
      <MiningStats balance={balance} isActive={miningActive} />
      <MiningControls 
        onStart={handleStartMining}
        onStop={() => setMiningActive(false)}
        disabled={miningActive}
      />
    </div>
  )
}

// ✅ RICHTIG - PropTypes oder TypeScript für Type Safety
MiningDashboard.propTypes = {
  userId: PropTypes.string.isRequired,
  initialBalance: PropTypes.number
}

// ❌ FALSCH - Class Components (nur in Ausnahmen)
class MiningDashboard extends Component {
  // Vermeiden, außer bei Legacy-Code
}
```

### Error Handling Rules
```javascript
// ✅ RICHTIG - Comprehensive Error Handling
const apiCall = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new APIError(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    
    if (error instanceof APIError) {
      throw error
    } else if (error.name === 'AbortError') {
      throw new APIError('Request timeout')
    } else {
      throw new APIError('Network error occurred')
    }
  }
}

// ✅ RICHTIG - Custom Error Classes
class MiningError extends Error {
  constructor(message, code = 'MINING_ERROR') {
    super(message)
    this.name = 'MiningError'
    this.code = code
  }
}

class APIError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

// ❌ FALSCH - Generic Error Handling
try {
  doSomething()
} catch (e) {
  // Keine spezifische Behandlung
}
```

## 🐍 Python/Django Coding Rules

### Django Model Rules
```python
# ✅ RICHTIG - Descriptive Model Names und Fields
class User(AbstractUser):
    """BSN User model with mining and wallet capabilities."""
    
    # Profile fields
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    verified = models.BooleanField(default=False)
    
    # Mining fields
    mining_active = models.BooleanField(default=False)
    mining_balance = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    daily_mining_claimed = models.DecimalField(max_digits=10, decimal_places=8, default=0)
    last_mining_activity = models.DateTimeField(null=True, blank=True)
    
    # Referral system
    referral_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bsn_users'
        indexes = [
            models.Index(fields=['mining_active']),
            models.Index(fields=['referral_code']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def get_mining_rate(self):
        """Calculate current mining rate based on user activity."""
        base_rate = settings.BASE_MINING_RATE
        
        # Apply boosts based on activity
        if self.is_premium_user():
            base_rate *= 1.5
            
        if self.get_referral_count() > 10:
            base_rate *= 1.2
            
        return min(base_rate, settings.MAX_MINING_RATE)
    
    def can_mine_today(self):
        """Check if user can still mine today."""
        if not self.mining_active:
            return False
            
        today = timezone.now().date()
        daily_limit = settings.DAILY_MINING_LIMIT
        
        return self.daily_mining_claimed < daily_limit

# ✅ RICHTIG - Mining Transaction Model
class MiningTransaction(models.Model):
    """Track all mining-related transactions."""
    
    TRANSACTION_TYPES = [
        ('passive', 'Passive Mining'),
        ('post_boost', 'Post Creation Boost'),
        ('comment_boost', 'Comment Boost'),
        ('referral_bonus', 'Referral Bonus'),
        ('daily_claim', 'Daily Claim'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mining_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    description = models.TextField(blank=True)
    
    # Metadata
    source_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bsn_mining_transactions'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['transaction_type']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_transaction_type_display()}: {self.amount} BSN"
```

### Django View Rules
```python
# ✅ RICHTIG - Class-Based Views mit Mixins
class MiningDashboardView(LoginRequiredMixin, View):
    """Handle mining dashboard requests."""
    
    def get(self, request):
        """Return user's mining dashboard data."""
        try:
            user = request.user
            
            # Check mining phase
            current_phase = get_current_mining_phase()
            
            if current_phase in ['alpha', 'beta']:
                # Mining disabled in early phases
                return JsonResponse({
                    'mining_enabled': False,
                    'phase': current_phase,
                    'message': 'Mining will be enabled at 100k users'
                })
            
            # Get mining data
            mining_data = {
                'balance': float(user.mining_balance),
                'daily_claimed': float(user.daily_mining_claimed),
                'daily_limit': float(settings.DAILY_MINING_LIMIT),
                'mining_active': user.mining_active,
                'can_mine': user.can_mine_today(),
                'mining_rate': float(user.get_mining_rate()),
                'last_activity': user.last_mining_activity.isoformat() if user.last_mining_activity else None
            }
            
            return JsonResponse({
                'success': True,
                'data': mining_data
            })
            
        except Exception as e:
            logger.error(f"Mining dashboard error for user {request.user.id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Failed to load mining dashboard'
            }, status=500)
    
    def post(self, request):
        """Handle mining control actions."""
        try:
            action = request.POST.get('action')
            user = request.user
            
            if action == 'start_mining':
                return self._start_mining(user)
            elif action == 'claim_rewards':
                return self._claim_rewards(user)
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid action'
                }, status=400)
                
        except Exception as e:
            logger.error(f"Mining action error for user {request.user.id}: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Mining action failed'
            }, status=500)
    
    def _start_mining(self, user):
        """Start mining for user."""
        if not user.can_mine_today():
            return JsonResponse({
                'success': False,
                'error': 'Daily mining limit reached'
            }, status=400)
        
        user.mining_active = True
        user.last_mining_activity = timezone.now()
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Mining started successfully'
        })
    
    def _claim_rewards(self, user):
        """Claim mining rewards for user."""
        if user.mining_balance <= 0:
            return JsonResponse({
                'success': False,
                'error': 'No rewards to claim'
            }, status=400)
        
        # Create claim transaction
        MiningTransaction.objects.create(
            user=user,
            transaction_type='daily_claim',
            amount=user.mining_balance,
            description=f'Daily mining claim: {user.mining_balance} BSN'
        )
        
        # Reset mining balance
        user.daily_mining_claimed += user.mining_balance
        user.mining_balance = 0
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Successfully claimed {user.mining_balance} BSN'
        })

# ✅ RICHTIG - API Serializers
class UserMiningSerializer(serializers.ModelSerializer):
    """Serialize user mining data."""
    
    mining_rate = serializers.SerializerMethodField()
    can_mine = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'mining_active', 
            'mining_balance', 
            'daily_mining_claimed',
            'mining_rate',
            'can_mine'
        ]
    
    def get_mining_rate(self, obj):
        return float(obj.get_mining_rate())
    
    def get_can_mine(self, obj):
        return obj.can_mine_today()
```

### Django Utility Functions
```python
# ✅ RICHTIG - Utility Functions with Error Handling
def get_current_mining_phase():
    """Determine current mining phase based on user count."""
    try:
        total_users = User.objects.count()
        
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

def calculate_mining_boost(user, activity_type):
    """Calculate mining boost for user activity."""
    boost_rates = {
        'post': 1.5,          # +50% for 30 minutes
        'comment': 1.2,       # +20% for 15 minutes
        'group_join': 2.0,    # +100% for 60 minutes
        'referral': 3.0,      # +200% for 24 hours
    }
    
    boost_durations = {
        'post': 30,           # minutes
        'comment': 15,        # minutes
        'group_join': 60,     # minutes
        'referral': 1440,     # minutes (24 hours)
    }
    
    if activity_type not in boost_rates:
        return {'multiplier': 1.0, 'duration': 0}
    
    return {
        'multiplier': boost_rates[activity_type],
        'duration': boost_durations[activity_type],
        'expires_at': timezone.now() + timedelta(minutes=boost_durations[activity_type])
    }

def validate_mining_transaction(user, amount, transaction_type):
    """Validate if mining transaction is allowed."""
    # Check daily limits
    if user.daily_mining_claimed + amount > settings.DAILY_MINING_LIMIT:
        raise ValidationError('Daily mining limit exceeded')
    
    # Check if mining is enabled for current phase
    current_phase = get_current_mining_phase()
    if current_phase in ['alpha', 'beta']:
        raise ValidationError('Mining not yet enabled')
    
    # Anti-fraud checks
    if not is_valid_mining_request(user):
        raise ValidationError('Invalid mining request')
    
    return True

def is_valid_mining_request(user):
    """Perform anti-fraud checks on mining request."""
    # Check for suspicious activity patterns
    recent_transactions = MiningTransaction.objects.filter(
        user=user,
        created_at__gte=timezone.now() - timedelta(hours=1)
    ).count()
    
    if recent_transactions > 60:  # More than 1 per minute average
        return False
    
    # Add more anti-fraud logic here
    return True
```

## 🔒 Security Coding Rules

### Input Validation Rules
```python
# ✅ RICHTIG - Input Validation
def validate_user_input(data):
    """Validate and sanitize user input."""
    cleaned_data = {}
    
    # Email validation
    if 'email' in data:
        email = data['email'].strip().lower()
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValidationError('Invalid email format')
        cleaned_data['email'] = email
    
    # Password validation
    if 'password' in data:
        password = data['password']
        if len(password) < 8:
            raise ValidationError('Password must be at least 8 characters')
        if not re.search(r'[A-Za-z]', password):
            raise ValidationError('Password must contain letters')
        if not re.search(r'[0-9]', password):
            raise ValidationError('Password must contain numbers')
        cleaned_data['password'] = password
    
    # Username validation
    if 'username' in data:
        username = data['username'].strip()
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            raise ValidationError('Username must be 3-20 characters, letters/numbers/underscore only')
        cleaned_data['username'] = username
    
    return cleaned_data

# ✅ RICHTIG - SQL Injection Prevention (Django ORM)
def get_user_mining_data(user_id):
    """Get mining data using Django ORM (prevents SQL injection)."""
    try:
        user = User.objects.select_related().get(id=user_id)
        transactions = MiningTransaction.objects.filter(
            user=user
        ).order_by('-created_at')[:10]
        
        return {
            'user': user,
            'recent_transactions': transactions
        }
    except User.DoesNotExist:
        raise ValidationError('User not found')

# ❌ FALSCH - Raw SQL (SQL Injection Risk)
def get_user_mining_data_unsafe(user_id):
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")  # DANGEROUS!
```

### Authentication Rules
```python
# ✅ RICHTIG - JWT Token Validation
def validate_jwt_token(token):
    """Validate JWT token with proper error handling."""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=['HS256']
        )
        
        # Check token expiration
        if payload.get('exp', 0) < time.time():
            raise AuthenticationError('Token expired')
        
        # Check user exists
        user_id = payload.get('user_id')
        if not User.objects.filter(id=user_id).exists():
            raise AuthenticationError('Invalid user')
        
        return payload
        
    except jwt.InvalidTokenError:
        raise AuthenticationError('Invalid token')
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise AuthenticationError('Token validation failed')

# ✅ RICHTIG - Rate Limiting
@ratelimit(key='ip', rate='100/h', method='POST')
def mining_api_view(request):
    """API view with rate limiting."""
    if getattr(request, 'limited', False):
        return JsonResponse({
            'error': 'Rate limit exceeded'
        }, status=429)
    
    # Process request
    return process_mining_request(request)
```

## ⚠️ Coding Verbote (DON'Ts)

### NIEMALS tun:
```python
# ❌ NIEMALS - Hardcoded Secrets
API_KEY = "sk-1234567890abcdef"  # Use environment variables!

# ❌ NIEMALS - Raw SQL ohne Parameterisierung
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# ❌ NIEMALS - Passwords im Klartext
user.password = "plaintext_password"  # Use Django's make_password()!

# ❌ NIEMALS - Admin-Funktionen ohne Authentifizierung
def delete_all_users():
    User.objects.all().delete()  # Needs admin verification!

# ❌ NIEMALS - Unbegrenzte Loops
while True:
    # ohne break condition

# ❌ NIEMALS - Exception ohne Logging
try:
    risky_operation()
except:
    pass  # Silent failures sind gefährlich!
```

```javascript
// ❌ NIEMALS - eval() verwenden
eval(user_input)  // Extrem gefährlich!

// ❌ NIEMALS - innerHTML mit User Input
element.innerHTML = user_input  // XSS Risk!

// ❌ NIEMALS - Unhandled Promises
api_call()  // Use await or .catch()!

// ❌ NIEMALS - Global Variables für State
var globalUserData = {}  // Use Context oder State Management!
```

## ✅ Code Review Checklist

Vor jedem Commit prüfen:
- [ ] Keine Hardcoded Secrets oder API Keys
- [ ] Alle User Inputs validiert und sanitized
- [ ] Error Handling implementiert
- [ ] Logging für kritische Operationen
- [ ] Rate Limiting für API Endpoints
- [ ] SQL Injection Prevention (ORM verwenden)
- [ ] XSS Prevention (keine innerHTML mit User Input)
- [ ] CSRF Protection für Forms
- [ ] Proper Authentication/Authorization
- [ ] Performance optimiert (keine N+1 Queries)
- [ ] Code kommentiert und dokumentiert
- [ ] Tests geschrieben für neue Features

**Diese Coding Standards sind bindend und müssen immer befolgt werden!** 