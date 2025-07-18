import os
import random
import django
import sys
from datetime import timedelta
from django.utils import timezone
import requests

print('DEBUG: Skriptstart, sys.path:', sys.path)

# Django Setup
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
try:
    django.setup()
    print('DEBUG: Django setup erfolgreich')
except Exception as e:
    print('FEHLER: Django setup fehlgeschlagen:', e)
    sys.exit(1)

try:
    from django.contrib.auth import get_user_model
    from bsn_social_network.models import Post, Story
    print('DEBUG: Django-Modelle importiert')
except Exception as e:
    print('FEHLER: Modelle konnten nicht importiert werden:', e)
    sys.exit(1)

# --- Konfiguration ---
USER_COUNT = 10
POSTS_PER_USER = (2, 3)  # min, max
PROFILE_AVATAR_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/media/profile_avatars'))
try:
    PROFILE_AVATAR_FILES = [f for f in os.listdir(PROFILE_AVATAR_DIR) if f.endswith('.png') or f.endswith('.jpg')]
    print('DEBUG: Profilbilder gefunden:', PROFILE_AVATAR_FILES)
except Exception as e:
    print('FEHLER: Profilbilder konnten nicht geladen werden:', e)
    PROFILE_AVATAR_FILES = []

# Beispielnamen
NAMES = [
    'Anna', 'Ben', 'Carla', 'David', 'Elena', 'Felix', 'Greta', 'Hannes', 'Isabel', 'Jonas',
    'Klara', 'Lukas', 'Mara', 'Nico', 'Olivia', 'Paul', 'Quirin', 'Rosa', 'Simon', 'Tina'
]

POST_CONTENTS = [
    'Das ist ein Testbeitrag!',
    'Hallo Welt! #test',
    'Schöner Tag heute ☀️',
    'Gerade an einem coolen Projekt! 🚀',
    'Wer hat Lust auf ein Meetup?',
    'Checkt mein neues Profilbild!',
    'Storytime: Heute ist mir was Lustiges passiert...',
    'Gibt es hier noch andere Entwickler?',
    'Was ist euer Lieblingsframework?',
    'Kaffee oder Tee? ☕️🍵'
]

STORY_CAPTIONS = [
    'Meine erste Story!',
    'Test-Story für das neue Feature.',
    'Guten Morgen zusammen!',
    'Was für ein Tag!',
    'Storytime...'
]

RANDOMUSER_API = 'https://randomuser.me/api/'
PICSUM_URL = 'https://picsum.photos/400/700'

# Hilfsfunktion: Lade ein Bild aus dem Internet und speichere es lokal
def download_image(url, local_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(local_path, 'wb') as f:
            f.write(response.content)
        return True
    return False

# Erzeuge Testuser mit echten Avataren
TEST_USERS = [
    {"username": "anna123", "first_name": "Anna", "last_name": "Müller", "gender": "female"},
    {"username": "mara351", "first_name": "Mara", "last_name": "Schmidt", "gender": "female"},
    {"username": "rosa541", "first_name": "Rosa", "last_name": "Weber", "gender": "female"},
    {"username": "hannes272", "first_name": "Hannes", "last_name": "Keller", "gender": "male"},
    {"username": "maximilian", "first_name": "Maximilian", "last_name": "Bauer", "gender": "male"},
    {"username": "tim123", "first_name": "Tim", "last_name": "Fischer", "gender": "male"},
    {"username": "lisa456", "first_name": "Lisa", "last_name": "Becker", "gender": "female"},
    {"username": "paul789", "first_name": "Paul", "last_name": "Schulz", "gender": "male"},
    {"username": "julia321", "first_name": "Julia", "last_name": "Hoffmann", "gender": "female"},
    {"username": "felix654", "first_name": "Felix", "last_name": "Wagner", "gender": "male"},
]

User = get_user_model()

# --- Hilfsfunktionen ---
def get_random_avatar():
    if not PROFILE_AVATAR_FILES:
        print('WARNUNG: Keine Profilbilder gefunden!')
        return ''
    filename = random.choice(PROFILE_AVATAR_FILES)
    return f'/media/profile_avatars/{filename}'

def get_random_name(used_names):
    name = random.choice([n for n in NAMES if n not in used_names])
    used_names.add(name)
    return name

def create_test_users():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    created_users = []
    for user_data in TEST_USERS:
        username = user_data["username"]
        gender = user_data["gender"]
        # Avatar-URL von randomuser.me
        avatar_url = f"https://randomuser.me/api/portraits/{'women' if gender == 'female' else 'men'}/{random.randint(1, 99)}.jpg"
        # Optional: Lade das Bild herunter und speichere es lokal (wenn du willst)
        # local_avatar = os.path.join(PROFILE_AVATAR_DIR, f"{username}.jpg")
        # download_image(avatar_url, local_avatar)
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "email": f"{username}@test.com",
                "avatar_url": avatar_url,
                "password": "test1234"
            }
        )
        if not created:
            user.avatar_url = avatar_url
            user.first_name = user_data["first_name"]
            user.last_name = user_data["last_name"]
            user.save()
        created_users.append(user)
    return created_users

def create_posts_for_user(user):
    num_posts = random.randint(*POSTS_PER_USER)
    for _ in range(num_posts):
        content = random.choice(POST_CONTENTS)
        try:
            post = Post.objects.create(
                author=user,
                content=content,
                media_url=None,
                privacy='public',
            )
            print(f'  Post erstellt für {user.username}: {content}')
        except Exception as e:
            print(f'FEHLER beim Erstellen von Post für {user.username}:', e)

def create_story_for_user(user):
    from bsn_social_network.models import Story
    from django.utils import timezone
    # Story-Bild von picsum.photos
    story_img_url = f"https://picsum.photos/seed/{user.username}/400/700"
    expires_at = timezone.now() + timedelta(hours=24)
    Story.objects.create(
        author=user,
        media_url=story_img_url,
        type="image",
        caption=f"Story von {user.first_name}",
        expires_at=expires_at,
        privacy="public"
    )

def update_urls_to_absolute():
    BASE_URL = 'http://localhost:8000'
    from django.contrib.auth import get_user_model
    from bsn_social_network.models import Story
    User = get_user_model()
    users = User.objects.all()
    for user in users:
        if user.avatar_url and user.avatar_url.startswith('/media/'):
            abs_url = BASE_URL + user.avatar_url
            user.avatar_url = abs_url
            user.save()
            print(f'Avatar-URL für {user.username} auf absolut gesetzt: {abs_url}')
    stories = Story.objects.all()
    for story in stories:
        if story.media_url and story.media_url.startswith('/media/'):
            abs_url = BASE_URL + story.media_url
            story.media_url = abs_url
            story.save()
            print(f'Story-URL für {story.author.username} auf absolut gesetzt: {abs_url}')

if __name__ == '__main__':
    import sys
    if '--update-urls' in sys.argv:
        print('--- Setze alle avatar_url und media_url auf absolute URLs ---')
        update_urls_to_absolute()
        print('--- Fertig! ---')
    else:
        print('--- Testnutzer werden erstellt ---')
        users = create_test_users()
        for user in users:
            create_posts_for_user(user)
            create_story_for_user(user)
        update_urls_to_absolute()
        print('--- Fertig! ---') 