from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from bsn_social_network.models import Post, Group
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test posts for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of the user to create posts for',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of posts to create (default: 5)',
        )

    def handle(self, *args, **options):
        user_email = options['user_email']
        count = options['count']

        if not user_email:
            self.stdout.write(
                self.style.ERROR('Please provide --user-email parameter')
            )
            return

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {user_email} not found')
            )
            return

        # Sample post content
        sample_posts = [
            "🚀 Just discovered this amazing blockchain social network! The future of social media is here! #BSN #Blockchain #SocialMedia",
            "💎 Mining some tokens today! The rewards are incredible. Who else is mining? #Mining #Crypto #Rewards",
            "🎯 Alpha access granted! This platform is revolutionary. The features are mind-blowing! #Alpha #Innovation",
            "🔥 Just created my first NFT collection! The possibilities are endless on BSN. #NFT #DigitalArt #Blockchain",
            "🌟 The community here is amazing! So many talented developers and creators. #Community #BSN #Network",
            "⚡ Real-time notifications are working perfectly! Love the instant updates. #RealTime #Notifications",
            "🎮 Token staking is live! Earning passive income while supporting the network. #Staking #PassiveIncome",
            "📱 Mobile experience is flawless! Can't believe how smooth everything works. #Mobile #UX #Design",
            "🔐 Security features are top-notch! Feel safe with my digital assets. #Security #Blockchain #Trust",
            "🚀 Just joined a DAO! Governance is the future of decentralized organizations. #DAO #Governance #DeFi"
        ]

        created_posts = []
        for i in range(count):
            content = random.choice(sample_posts)
            post = Post.objects.create(
                author=user,
                content=content,
                created_at=timezone.now()
            )
            created_posts.append(post)
            self.stdout.write(
                self.style.SUCCESS(f'Created post {i+1}: {content[:50]}...')
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_posts)} test posts for user {user.email}'
            )
        ) 