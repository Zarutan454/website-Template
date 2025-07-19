from django.core.management.base import BaseCommand
from bsn_social_network.models import User

class Command(BaseCommand):
    help = 'Repariert User Display Names für Posts'

    def handle(self, *args, **options):
        self.stdout.write("=== USER DISPLAY NAMES REPARIEREN ===")
        
        # Alle User abrufen
        users = User.objects.all()
        self.stdout.write(f"Anzahl User gefunden: {users.count()}")
        
        fixed_count = 0
        
        for user in users:
            # Prüfe ob User Display Name fehlt
            if not user.first_name and not user.last_name:
                # Setze first_name auf username als Fallback
                user.first_name = user.username
                user.save()
                self.stdout.write(f"✅ User '{user.username}' Display Name repariert")
                fixed_count += 1
            else:
                self.stdout.write(f"ℹ️  User '{user.username}' hat bereits Display Name")
        
        self.stdout.write(f"\n=== FERTIG ===")
        self.stdout.write(f"Reparierte User: {fixed_count}")
        self.stdout.write(f"Gesamt User: {users.count()}")
        
        # Zeige Beispiel-User an
        if users.count() > 0:
            user = users.first()
            self.stdout.write(f"\n=== BEISPIEL USER ===")
            self.stdout.write(f"Username: {user.username}")
            self.stdout.write(f"First Name: '{user.first_name}'")
            self.stdout.write(f"Last Name: '{user.last_name}'")
            
            # Teste Display Name
            if user.first_name and user.last_name:
                display_name = f"{user.first_name} {user.last_name}"
            elif user.first_name:
                display_name = user.first_name
            elif user.last_name:
                display_name = user.last_name
            else:
                display_name = user.username
            
            self.stdout.write(f"Display Name: '{display_name}'") 