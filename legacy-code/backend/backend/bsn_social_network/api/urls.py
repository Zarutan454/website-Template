from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Schema für Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="BSN Social Network API",
        default_version='v1',
        description="API für das BSN Social Network mit Features für Benutzerinteraktionen, Content-Sharing und Community-Building",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# API-URLs
urlpatterns = [
    # Swagger/OpenAPI
    path('docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API v1 Endpoints
    path('v1/auth/', include('bsn_social_network.api.v1.auth.urls')),
    path('v1/users/', include('bsn_social_network.api.v1.users.urls')),
    path('v1/posts/', include('bsn_social_network.api.v1.posts.urls')),
    path('v1/groups/', include('bsn_social_network.api.v1.groups.urls')),
    path('v1/wallet/', include('bsn_social_network.api.v1.wallet.urls')),
    path('v1/nft/', include('bsn_social_network.api.v1.nft.urls')),
    path('v1/dao/', include('bsn_social_network.api.v1.dao.urls')),
    path('v1/mining/', include('bsn_social_network.api.v1.mining.urls')),
    path('v1/chats/', include('bsn_social_network.api.v1.chat.urls')),
    path('v1/ico/', include('bsn_social_network.api.v1.ico.urls')),
] 