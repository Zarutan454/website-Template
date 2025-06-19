from django.urls import path
from . import views

app_name = 'landing'

urlpatterns = [
    # Token reservations
    path('reservations/', views.TokenReservationView.as_view(), name='reservations'),
    path('reservations/<uuid:reservation_id>/', views.TokenReservationDetailView.as_view(), name='reservation-detail'),
    
    # Faucet
    path('faucet/', views.FaucetRequestView.as_view(), name='faucet'),
    
    # Referrals
    path('referral/code/', views.ReferralCodeView.as_view(), name='referral-code'),
    path('referral/program/', views.ReferralProgramView.as_view(), name='referral-program'),
    
    # Newsletter
    path('newsletter/subscribe/', views.NewsletterSubscriptionView.as_view(), name='newsletter-subscribe'),
    path('newsletter/unsubscribe/', views.NewsletterUnsubscribeView.as_view(), name='newsletter-unsubscribe'),
    
    # Contact form
    path('contact/', views.ContactFormView.as_view(), name='contact'),
    
    # ICO statistics
    path('ico/overview/', views.ico_overview, name='ico-overview'),
    path('ico/stats/', views.ico_stats, name='ico-stats'),
    path('ico/token-info/', views.token_price_info, name='token-info'),
] 