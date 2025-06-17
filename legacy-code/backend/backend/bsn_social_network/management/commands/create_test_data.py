from django.core.management.base import BaseCommand
from django.utils import timezone
from bsn_social_network.models import User, Post
import random
from faker import Faker

class Command(BaseCommand):
    help = 'Erstellt Testdaten für Posts'

    def handle(self, *args, **kwargs):
        fake = Faker('de_DE')
        
        # Prüfe, ob Benutzer existieren
        users = User.objects.all()
        if not users.exists():
            self.stdout.write(self.style.ERROR('Keine Benutzer gefunden. Bitte erstelle zuerst Benutzer.'))
            return
            
        # Lösche bestehende Posts, wenn gewünscht
        if Post.objects.exists():
            delete_existing = input('Bestehende Posts löschen? (j/n): ').lower() == 'j'
            if delete_existing:
                Post.objects.all().delete()
                self.stdout.write(self.style.SUCCESS('Bestehende Posts wurden gelöscht.'))
        
        # Anzahl der zu erstellenden Posts
        num_posts = int(input('Anzahl der zu erstellenden Posts (empfohlen: 20-50): ') or '30')
        
        # Erstelle Posts
        posts_created = 0
        for _ in range(num_posts):
            user = random.choice(users)
            
            # Erstelle einen Post mit zufälligem Inhalt
            content = fake.paragraph(nb_sentences=random.randint(1, 5))
            
            # Füge manchmal Hashtags hinzu
            if random.random() > 0.7:
                num_hashtags = random.randint(1, 3)
                hashtags = [f"#{fake.word()}" for _ in range(num_hashtags)]
                content += " " + " ".join(hashtags)
            
            # Erstelle den Post
            Post.objects.create(
                author=user,
                content=content,
                created_at=timezone.now() - timezone.timedelta(days=random.randint(0, 30)),
                updated_at=timezone.now(),
            )
            posts_created += 1
            
        self.stdout.write(self.style.SUCCESS(f'{posts_created} Posts wurden erfolgreich erstellt.')) 