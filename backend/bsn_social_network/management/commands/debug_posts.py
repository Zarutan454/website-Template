from django.core.management.base import BaseCommand
from bsn_social_network.models import Post, User
from bsn_social_network.serializers import PostSerializer
from rest_framework.test import APIRequestFactory

class Command(BaseCommand):
    help = 'Debug Posts und User-Daten'

    def handle(self, *args, **options):
        self.stdout.write("=== POST DEBUG ===")
        
        # Alle Posts abrufen
        posts = Post.objects.all().select_related('author')
        self.stdout.write(f"Anzahl Posts: {posts.count()}")
        
        if posts.count() == 0:
            self.stdout.write("Keine Posts gefunden!")
            return
        
        # Ersten Post analysieren
        post = posts.first()
        self.stdout.write(f"\n=== ERSTER POST ===")
        self.stdout.write(f"Post ID: {post.id}")
        self.stdout.write(f"Content: {post.content[:50]}...")
        self.stdout.write(f"Author ID: {post.author_id}")
        self.stdout.write(f"Author: {post.author}")
        
        if post.author:
            self.stdout.write(f"Author Username: {post.author.username}")
            self.stdout.write(f"Author First Name: {post.author.first_name}")
            self.stdout.write(f"Author Last Name: {post.author.last_name}")
            self.stdout.write(f"Author Email: {post.author.email}")
            self.stdout.write(f"Author is_active: {post.author.is_active}")
        else:
            self.stdout.write(self.style.ERROR("❌ POST HAT KEINEN AUTHOR!"))
        
        # Serializer testen
        self.stdout.write(f"\n=== SERIALIZER TEST ===")
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = post.author if post.author else None
        
        serializer = PostSerializer(post, context={'request': request})
        data = serializer.data
        self.stdout.write(f"Serialized data:")
        self.stdout.write(f"  - id: {data.get('id')}")
        self.stdout.write(f"  - content: {data.get('content')[:50]}...")
        
        author_data = data.get('author')
        if author_data:
            self.stdout.write(f"  - author.id: {author_data.get('id')}")
            self.stdout.write(f"  - author.username: {author_data.get('username')}")
            self.stdout.write(f"  - author.display_name: {author_data.get('display_name')}")
            self.stdout.write(f"  - author.avatar_url: {author_data.get('avatar_url')}")
            self.stdout.write(f"  - author.is_verified: {author_data.get('is_verified')}")
        else:
            self.stdout.write(self.style.ERROR("❌ KEINE AUTHOR-DATEN IM SERIALIZER!"))
        
        # Alle User überprüfen
        self.stdout.write(f"\n=== ALLE USER ===")
        users = User.objects.all()
        self.stdout.write(f"Anzahl User: {users.count()}")
        
        for user in users[:5]:  # Erste 5 User
            self.stdout.write(f"  - ID: {user.id}, Username: {user.username}, Name: {user.first_name} {user.last_name}, Active: {user.is_active}")
        
        # Posts ohne Author finden
        posts_without_author = Post.objects.filter(author__isnull=True)
        if posts_without_author.exists():
            self.stdout.write(self.style.WARNING(f"\n❌ WARNUNG: {posts_without_author.count()} Posts ohne Author gefunden!"))
            for p in posts_without_author:
                self.stdout.write(f"  - Post ID {p.id}: {p.content[:30]}...")
        else:
            self.stdout.write(self.style.SUCCESS(f"\n✅ Alle Posts haben einen Author")) 