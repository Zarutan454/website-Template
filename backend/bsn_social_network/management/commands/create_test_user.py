from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from bsn_social_network.models import Group, GroupMembership
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='testuser',
            help='Username for the test user (default: testuser)',
        )
        parser.add_argument(
            '--email',
            type=str,
            default='test@example.com',
            help='Email for the test user (default: test@example.com)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='test123',
            help='Password for the test user (default: test123)',
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User {username} already exists')
            )
            user = User.objects.get(username=username)
        else:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name='Test',
                last_name='User'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created test user: {username}')
            )

        # Add user to first group as admin if group exists
        try:
            group = Group.objects.first()
            if group:
                membership, created = GroupMembership.objects.get_or_create(
                    group=group,
                    user=user,
                    defaults={'role': 'admin'}
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Added {username} as admin to group: {group.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'{username} is already a member of {group.name}')
                    )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error adding user to group: {e}')
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Test user ready: {username} / {password}'
            )
        ) 