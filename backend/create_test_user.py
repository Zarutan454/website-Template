#!/usr/bin/env python
"""
Skript zum Erstellen eines Testbenutzers für BSN
"""
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from bsn_social_network.models import Wallet, MiningProgress

User = get_user_model()

def create_test_user():
    """Erstellt einen Testbenutzer für die Anmeldung"""
    
    # Benutzerdaten
    username = 'testuser'
    email = 'test@bsn.network'
    password = 'TestPass123!'
    
    try:
        # Prüfe, ob Benutzer bereits existiert
        if User.objects.filter(username=username).exists():
            print(f"❌ Benutzer '{username}' existiert bereits!")
            # Lösche den alten Benutzer
            User.objects.filter(username=username).delete()
            print(f"🗑️ Alter Benutzer gelöscht, erstelle neuen...")
        
        if User.objects.filter(email=email).exists():
            print(f"❌ Email '{email}' ist bereits registriert!")
            User.objects.filter(email=email).delete()
            print(f"🗑️ Alte Email gelöscht, erstelle neue...")
        
        # Erstelle neuen Benutzer
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='Test',
            last_name='User'
        )
        
        # Gebe Alpha Access
        user.is_alpha_user = True
        user.alpha_access_granted_at = timezone.now()
        user.alpha_access_method = 'manual'
        user.save()
        
        # Erstelle Wallet
        wallet = Wallet.objects.create(
            user=user,
            balance=1000.0,  # Startguthaben
            address=f"0x{user.id:040x}"  # Mock wallet address
        )
        
        # Erstelle Mining Progress (nur mit verfügbaren Feldern)
        mining = MiningProgress.objects.create(
            user=user,
            total_mined=100.0,
            accumulated_tokens=25.5,
            mining_power=2.5,
            streak_days=7,
            last_claim_time=timezone.now()
        )
        
        print("✅ Testbenutzer erfolgreich erstellt!")
        print(f"👤 Username: {username}")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")
        print(f"🆔 User ID: {user.id}")
        print(f"💰 Wallet Balance: {wallet.balance} BSN")
        print(f"⛏️ Mining Power: {mining.mining_power}")
        print(f"🔥 Streak: {mining.streak_days} days")
        print("\n🚀 Du kannst dich jetzt im Frontend anmelden!")
        
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim Erstellen des Testbenutzers: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🔧 Erstelle Testbenutzer für BSN...")
    success = create_test_user()
    
    if success:
        print("\n📋 Nächste Schritte:")
        print("1. Starte das Frontend: npm run dev")
        print("2. Starte das Backend: python manage.py runserver")
        print("3. Gehe zu: http://localhost:5176/login")
        print("4. Melde dich mit den obigen Daten an")
    else:
        print("\n❌ Testbenutzer konnte nicht erstellt werden!")
        sys.exit(1) 