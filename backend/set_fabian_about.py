from users.models import UserProfile
from django.contrib.auth import get_user_model
User = get_user_model()

u = User.objects.get(username='Fabian')
p, _ = UserProfile.objects.get_or_create(user=u)
p.bio = 'Das ist meine Bio. Ich liebe Coding und Blockchain!'
p.occupation = 'Softwareentwickler'
p.company = 'BSN AG'
p.interests = ['Blockchain', 'AI', 'Open Source']
p.skills = ['Python', 'React', 'Django']
p.social_media_links = {'Twitter': 'https://twitter.com/fabian', 'GitHub': 'https://github.com/fabian'}
p.save()
print('OK') 