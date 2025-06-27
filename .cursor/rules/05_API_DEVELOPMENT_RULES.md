# BSN API-Entwicklungsregeln für Cursor

## 🌐 API-Design Prinzipien

### REST-API Standards (Verpflichtend)
```
Basis-URL: /api/v1/
HTTP-Methoden: GET, POST, PUT, PATCH, DELETE
Response-Format: JSON
Authentication: JWT Bearer Token
Rate-Limiting: 100 requests/minute/IP
```

### URL-Namenskonventionen
```python
# ✅ RICHTIG - RESTful URL-Design
/api/v1/auth/login/              # POST - User login
/api/v1/auth/register/           # POST - User registration
/api/v1/users/profile/           # GET, PUT - User profile
/api/v1/mining/status/           # GET - Mining status
/api/v1/mining/start/            # POST - Start mining
/api/v1/faucet/claim/            # POST - Claim faucet
/api/v1/tokens/reserve/          # POST - Reserve tokens
/api/v1/referrals/             # GET, POST - Referral management

# ❌ FALSCH - Unklare URL-Struktur
/api/getUserData/              # Nicht RESTful
/api/mine/                     # Zu unspezifisch
/api/v1/do_something/          # Unklare Aktion
```

## 🔒 Authentication & Authorization Rules

### JWT Token Implementation
```python
# ✅ RICHTIG - JWT Token Handling
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

class BSNJWTAuthentication(JWTAuthentication):
    """Custom JWT Authentication für BSN."""
    
    def authenticate(self, request):
        try:
            result = super().authenticate(request)
            if result:
                user, token = result
                
                # Zusätzliche BSN-spezifische Checks
                if not user.is_active:
                    raise AuthenticationFailed('User account disabled')
                
                if user.is_banned:
                    raise AuthenticationFailed('User account banned')
                
                # Update last activity
                user.last_activity = timezone.now()
                user.save(update_fields=['last_activity'])
                
                return (user, token)
            return None
            
        except Exception as e:
            logger.error(f"JWT Authentication error: {str(e)}")
            return None

# ✅ RICHTIG - Custom Token Claims
def get_tokens_for_user(user):
    """Generate JWT tokens with custom claims für BSN."""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['user_id'] = user.id
    refresh['username'] = user.username
    refresh['is_verified'] = user.is_email_verified
    refresh['mining_eligible'] = user.can_mine_today()
    refresh['user_level'] = user.get_user_level()
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# ✅ RICHTIG - Permission Classes
class IsMiningEligible(BasePermission):
    """Permission check for mining operations."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user can mine (Phase + Limits)
        current_phase = get_current_mining_phase()
        if current_phase in ['alpha', 'beta']:
            return False  # No real mining in early phases
        
        return request.user.can_mine_today()

class IsEmailVerified(BasePermission):
    """Permission check for email verification."""
    
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.is_email_verified)
```

### API Authentication Flow
```python
# ✅ RICHTIG - Secure Authentication View
class LoginView(APIView):
    """Secure login with rate limiting and logging."""
    
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]  # 5 attempts per minute
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            # Log failed validation
            logger.warning(f"Login validation failed from IP {get_client_ip(request)}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            # Authenticate user
            user = authenticate(request, username=email, password=password)
            
            if not user:
                # Log failed login attempt
                logger.warning(f"Failed login attempt for {email} from IP {get_client_ip(request)}")
                return Response({
                    'success': False,
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    'success': False,
                    'error': 'Account disabled'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate tokens
            tokens = get_tokens_for_user(user)
            
            # Log successful login
            logger.info(f"Successful login for user {user.id} from IP {get_client_ip(request)}")
            
            # Update login statistics
            user.last_login = timezone.now()
            user.login_count += 1
            user.save(update_fields=['last_login', 'login_count'])
            
            return Response({
                'success': True,
                'data': {
                    'user': UserProfileSerializer(user).data,
                    'tokens': tokens
                },
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Login error for {email}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Login failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

## 📊 API Response Standards

### Standardized Response Format
```python
# ✅ RICHTIG - Konsistente API Response Structure
class BSNAPIResponse:
    """Standardized API response format for BSN."""
    
    @staticmethod
    def success(data=None, message="Success", status_code=200):
        response_data = {
            'success': True,
            'message': message,
            'timestamp': timezone.now().isoformat()
        }
        
        if data is not None:
            response_data['data'] = data
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(error_message, error_code=None, status_code=400, details=None):
        response_data = {
            'success': False,
            'error': error_message,
            'timestamp': timezone.now().isoformat()
        }
        
        if error_code:
            response_data['error_code'] = error_code
            
        if details:
            response_data['details'] = details
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def validation_error(serializer_errors):
        return BSNAPIResponse.error(
            error_message="Validation failed",
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=serializer_errors
        )

# ✅ RICHTIG - API View mit standardisierter Response
class MiningStatusView(APIView):
    """Mining status endpoint mit consistent responses."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            current_phase = get_current_mining_phase()
            
            # Phase-basierte Response
            if current_phase in ['alpha', 'beta']:
                return BSNAPIResponse.success({
                    'mining_enabled': False,
                    'phase': current_phase,
                    'simulation_mode': True,
                    'user_count': User.objects.count(),
                    'launch_threshold': 100000,
                    'message': f'Mining aktiviert sich bei 100k Nutzern'
                })
            
            # Active mining data
            mining_data = {
                'mining_enabled': True,
                'phase': current_phase,
                'simulation_mode': False,
                'balance': float(user.mining_balance),
                'daily_limit': float(user.get_daily_mining_limit()),
                'daily_mined': float(user.get_daily_mining_amount()),
                'can_mine': user.can_mine_today(),
                'mining_rate': float(user.get_current_mining_rate()),
                'active_boosts': user.get_active_boosts()
            }
            
            return BSNAPIResponse.success(
                data=mining_data,
                message="Mining status retrieved successfully"
            )
            
        except Exception as e:
            logger.error(f"Mining status error for user {request.user.id}: {str(e)}")
            return BSNAPIResponse.error(
                error_message="Failed to retrieve mining status",
                error_code="MINING_STATUS_ERROR",
                status_code=500
            )
```

### Error Handling Standards
```python
# ✅ RICHTIG - Comprehensive Error Handling
class BSNAPIException(APIException):
    """Base exception for BSN API errors."""
    status_code = 400
    default_detail = 'An error occurred'
    default_code = 'bsn_error'

class MiningNotAvailableException(BSNAPIException):
    """Exception for mining not available."""
    status_code = 400
    default_detail = 'Mining not available in current phase'
    default_code = 'mining_not_available'

class DailyLimitExceededException(BSNAPIException):
    """Exception for daily limit exceeded."""
    status_code = 400
    default_detail = 'Daily mining limit exceeded'
    default_code = 'daily_limit_exceeded'

class AntiFramdException(BSNAPIException):
    """Exception for anti-fraud detection."""
    status_code = 403
    default_detail = 'Suspicious activity detected'
    default_code = 'anti_fraud_triggered'

# ✅ RICHTIG - Global Exception Handler
def custom_exception_handler(exc, context):
    """Custom exception handler for BSN API."""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the error
        request = context.get('request')
        logger.error(f"API Error: {exc} - Request: {request.path if request else 'Unknown'}")
        
        # Customize the response format
        custom_response_data = {
            'success': False,
            'error': response.data.get('detail', str(exc)),
            'error_code': getattr(exc, 'default_code', 'api_error'),
            'timestamp': timezone.now().isoformat()
        }
        
        # Add field errors if validation error
        if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
            custom_response_data['field_errors'] = exc.detail
        
        response.data = custom_response_data
    
    return response
```

## 🔄 API Serializers Rules

### Input Validation Serializers
```python
# ✅ RICHTIG - Comprehensive Input Validation
class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration with comprehensive validation."""
    
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20
    )
    accept_terms = serializers.BooleanField(required=True)
    accept_privacy = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'password', 'confirm_password', 'referral_code',
            'accept_terms', 'accept_privacy'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness and format."""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Email bereits registriert")
        return value.lower()
    
    def validate_username(self, value):
        """Validate username uniqueness and format."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username bereits vergeben")
        
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', value):
            raise serializers.ValidationError(
                "Username: 3-20 Zeichen, nur Buchstaben, Zahlen und Unterstrich"
            )
        return value
    
    def validate_referral_code(self, value):
        """Validate referral code if provided."""
        if value and not User.objects.filter(referral_code=value).exists():
            raise serializers.ValidationError("Ungültiger Referral-Code")
        return value
    
    def validate(self, attrs):
        """Cross-field validation."""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwörter stimmen nicht überein")
        
        if not attrs['accept_terms']:
            raise serializers.ValidationError("AGB müssen akzeptiert werden")
        
        if not attrs['accept_privacy']:
            raise serializers.ValidationError("Datenschutz muss akzeptiert werden")
        
        return attrs
    
    def create(self, validated_data):
        """Create user with proper password hashing."""
        validated_data.pop('confirm_password')
        validated_data.pop('accept_terms')
        validated_data.pop('accept_privacy')
        
        # Handle referral
        referral_code = validated_data.pop('referral_code', None)
        referred_by = None
        if referral_code:
            referred_by = User.objects.filter(referral_code=referral_code).first()
        
        # Create user
        user = User.objects.create_user(
            **validated_data,
            referred_by=referred_by
        )
        
        # Generate unique referral code
        user.referral_code = generate_unique_referral_code()
        user.save()
        
        # Send verification email
        send_verification_email.delay(user.id)
        
        return user

# ✅ RICHTIG - Mining Action Serializer
class MiningActionSerializer(serializers.Serializer):
    """Serializer for mining actions."""
    
    action = serializers.ChoiceField(
        choices=['start', 'stop', 'claim'],
        required=True
    )
    
    def validate_action(self, value):
        """Validate mining action based on current phase."""
        current_phase = get_current_mining_phase()
        
        if current_phase in ['alpha', 'beta'] and value in ['start', 'claim']:
            raise serializers.ValidationError(
                f"Mining-Aktionen nicht verfügbar in {current_phase} Phase"
            )
        
        return value
```

### Output Serializers
```python
# ✅ RICHTIG - Secure Output Serialization
class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer - secure output."""
    
    mining_balance = serializers.SerializerMethodField()
    referral_count = serializers.SerializerMethodField()
    mining_eligible = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'is_email_verified', 'avatar', 'bio', 'created_at',
            'mining_balance', 'referral_count', 'mining_eligible'
        ]
        read_only_fields = ['id', 'email', 'created_at']
    
    def get_mining_balance(self, obj):
        """Get user's mining balance."""
        return float(obj.mining_balance)
    
    def get_referral_count(self, obj):
        """Get user's referral count."""
        return obj.referrals.filter(is_active=True).count()
    
    def get_mining_eligible(self, obj):
        """Check if user is eligible for mining."""
        current_phase = get_current_mining_phase()
        if current_phase in ['alpha', 'beta']:
            return False
        return obj.can_mine_today()

# ✅ RICHTIG - Mining Statistics Serializer
class MiningStatsSerializer(serializers.Serializer):
    """Mining statistics serializer."""
    
    total_mined = serializers.DecimalField(max_digits=20, decimal_places=8)
    daily_mined = serializers.DecimalField(max_digits=10, decimal_places=8)
    daily_limit = serializers.DecimalField(max_digits=10, decimal_places=8)
    remaining_limit = serializers.DecimalField(max_digits=10, decimal_places=8)
    current_rate = serializers.DecimalField(max_digits=10, decimal_places=6)
    active_boosts = serializers.ListField()
    mining_phase = serializers.CharField()
    simulation_mode = serializers.BooleanField()
```

## 🔗 API Endpoint Implementation Rules

### ViewSet Implementation
```python
# ✅ RICHTIG - Comprehensive API ViewSet
class FaucetViewSet(viewsets.ViewSet):
    """Faucet system API endpoints."""
    
    permission_classes = [IsAuthenticated, IsEmailVerified]
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get faucet status for user."""
        try:
            user = request.user
            faucet_settings = user.get_faucet_settings()
            
            data = {
                'can_claim': faucet_settings.can_claim_standard(),
                'next_claim': faucet_settings.next_standard_claim.isoformat(),
                'last_claim': faucet_settings.get_last_claim_time(),
                'total_claimed': float(faucet_settings.total_claimed),
                'consecutive_days': faucet_settings.consecutive_days,
                'available_bonuses': faucet_settings.get_available_bonuses()
            }
            
            return BSNAPIResponse.success(data, "Faucet status retrieved")
            
        except Exception as e:
            logger.error(f"Faucet status error: {str(e)}")
            return BSNAPIResponse.error("Failed to get faucet status", status_code=500)
    
    @action(detail=False, methods=['post'])
    def claim(self, request):
        """Claim faucet tokens."""
        try:
            user = request.user
            claim_type = request.data.get('claim_type', 'standard')
            
            # Validate claim
            if not validate_faucet_claim(user, claim_type):
                return BSNAPIResponse.error(
                    "Faucet claim not available",
                    error_code="CLAIM_NOT_AVAILABLE"
                )
            
            # Process claim
            claim_result = process_faucet_claim(user, claim_type, request)
            
            return BSNAPIResponse.success(
                data=claim_result,
                message=f"Successfully claimed {claim_result['amount']} BSN"
            )
            
        except Exception as e:
            logger.error(f"Faucet claim error: {str(e)}")
            return BSNAPIResponse.error("Faucet claim failed", status_code=500)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get faucet claim history."""
        try:
            user = request.user
            page = int(request.query_params.get('page', 1))
            per_page = min(int(request.query_params.get('per_page', 20)), 100)
            
            claims = user.faucet_claims.all()
            paginator = Paginator(claims, per_page)
            page_obj = paginator.get_page(page)
            
            data = {
                'claims': FaucetClaimSerializer(page_obj, many=True).data,
                'pagination': {
                    'current_page': page,
                    'total_pages': paginator.num_pages,
                    'total_items': paginator.count,
                    'per_page': per_page
                }
            }
            
            return BSNAPIResponse.success(data, "Faucet history retrieved")
            
        except Exception as e:
            logger.error(f"Faucet history error: {str(e)}")
            return BSNAPIResponse.error("Failed to get faucet history", status_code=500)
```

## 🛡️ API Security Rules

### Rate Limiting
```python
# ✅ RICHTIG - Custom Rate Limiting
class BSNRateThrottle(UserRateThrottle):
    """Custom rate throttle for BSN API."""
    
    def get_cache_key(self, request, view):
        """Custom cache key including user and endpoint."""
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
            'endpoint': view.__class__.__name__
        }

class MiningRateThrottle(BSNRateThrottle):
    scope = 'mining'  # 10 requests per minute

class FaucetRateThrottle(BSNRateThrottle):
    scope = 'faucet'  # 5 requests per minute

class AuthRateThrottle(BSNRateThrottle):
    scope = 'auth'    # 5 requests per minute

# ✅ RICHTIG - Rate Limiting in Views
class MiningAPIView(APIView):
    throttle_classes = [MiningRateThrottle]
    permission_classes = [IsAuthenticated, IsMiningEligible]
    
    def post(self, request):
        # Mining logic with rate limiting
        pass
```

### Input Sanitization
```python
# ✅ RICHTIG - Input Sanitization
import bleach
from django.utils.html import escape

def sanitize_user_input(text):
    """Sanitize user input to prevent XSS."""
    if not text:
        return text
    
    # Remove HTML tags and escape special characters
    clean_text = bleach.clean(text, strip=True)
    return escape(clean_text)

class PostSerializer(serializers.ModelSerializer):
    """Post serializer with input sanitization."""
    
    content = serializers.CharField(max_length=2000)
    
    def validate_content(self, value):
        """Sanitize post content."""
        return sanitize_user_input(value)
```

## ⚠️ API Development DON'Ts

### NIEMALS in API Code:
```python
# ❌ NIEMALS - Ungeschützte Endpoints
@api_view(['GET'])
def get_all_users(request):
    users = User.objects.all()  # Datenschutz-Problem!
    return Response(UserSerializer(users, many=True).data)

# ❌ NIEMALS - Raw SQL in API Views
def get_mining_data(request):
    cursor.execute(f"SELECT * FROM mining WHERE user_id = {request.user.id}")
    # SQL Injection Risk!

# ❌ NIEMALS - Passwörter in Response
class BadUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']  # GEFÄHRLICH!

# ❌ NIEMALS - Unvalidated Input
@api_view(['POST'])
def create_post(request):
    Post.objects.create(
        content=request.data['content']  # Kein Sanitizing!
    )

# ❌ NIEMALS - Hardcoded Limits
def process_faucet_claim(user):
    user.balance += 1.0  # Hardcoded = schlecht!
```

## ✅ API Development Checklist

Vor jedem API-Endpoint-Commit:
- [ ] Authentication/Authorization implementiert
- [ ] Input-Validation mit Serializers
- [ ] Output-Sanitization für Responses
- [ ] Rate-Limiting konfiguriert
- [ ] Error-Handling implementiert
- [ ] Logging für kritische Operationen
- [ ] API-Tests geschrieben
- [ ] Dokumentation aktualisiert
- [ ] Security-Review durchgeführt
- [ ] Performance-Optimierung geprüft

**Diese API-Regeln sind bindend für alle BSN-API-Entwicklungen!** 