from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from jwt import decode as jwt_decode
from urllib.parse import parse_qs
import json

class TokenAuthMiddleware:
    """
    Middleware für die Authentifizierung von WebSocket-Verbindungen mit JWT-Tokens
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Verbindung zur Datenbank schließen, um Fehler zu vermeiden
        close_old_connections()

        # Token aus den Query-Parametern extrahieren
        query_params = parse_qs(scope["query_string"].decode())
        token = query_params.get("token", [None])[0]

        # Benutzer standardmäßig als anonym festlegen
        scope["user"] = AnonymousUser()

        # Wenn ein Token vorhanden ist, versuchen, den Benutzer zu authentifizieren
        if token:
            try:
                # Token validieren
                UntypedToken(token)
                
                # Token-Payload decodieren
                token_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                
                # Benutzer-ID aus dem Token extrahieren
                user_id = token_data.get("user_id")
                
                if user_id:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    
                    # Benutzer aus der Datenbank abrufen
                    user = await self.get_user(user_id)
                    
                    if user:
                        # Benutzer im Scope speichern
                        scope["user"] = user
            except (InvalidToken, TokenError):
                pass

        return await self.app(scope, receive, send)
    
    async def get_user(self, user_id):
        """
        Benutzer aus der Datenbank abrufen
        """
        from channels.db import database_sync_to_async
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            return await database_sync_to_async(User.objects.get)(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser() 