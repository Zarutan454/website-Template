from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Grant alpha access to a user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            required=True,
            help='Email of the user to grant alpha access to',
        )
        parser.add_argument(
            '--reason',
            type=str,
            default='manual',
            choices=['referral', 'investment', 'influencer', 'internal', 'manual'],
            help='Reason for granting alpha access (default: manual)',
        )

    def handle(self, *args, **options):
        user_email = options['user_email']
        reason = options['reason']

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {user_email} not found')
            )
            return

        if user.is_alpha_user:
            self.stdout.write(
                self.style.WARNING(f'User {user.email} already has alpha access')
            )
            return

        # Grant alpha access
        user.is_alpha_user = True
        user.alpha_access_granted_at = timezone.now()
        user.alpha_access_reason = reason
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully granted alpha access to {user.email} (reason: {reason})'
            )
        ) 