"""
ASGI config for bsn_social_network project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

# Set up Django settings first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn_social_network.settings')

# Get Django's ASGI application
django_asgi_app = get_asgi_application()

# Import websocket routes
from bsn_social_network.routing import websocket_urlpatterns
from bsn_social_network.middleware import TokenAuthMiddleware

# Configure ASGI application
application = ProtocolTypeRouter({
    # HTTP requests are handled by Django's standard ASGI application
    "http": django_asgi_app,
    
    # WebSocket requests are handled with the routing defined in routing.py
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})