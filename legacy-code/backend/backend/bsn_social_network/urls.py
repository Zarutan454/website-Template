"""
URL Configuration for bsn_social_network project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bsn_social_network.api.urls')),  # API Endpoints
    path('api-auth/', include('rest_framework.urls')),     # DRF Auth
    path('', RedirectView.as_view(url='/admin/'), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)