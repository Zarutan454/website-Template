import django
import os
import sys

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from bsn_social_network.models import Group, GroupMembership
from django.db import transaction

fixed = 0
with transaction.atomic():
    for group in Group.objects.all():
        if not GroupMembership.objects.filter(group=group, user=group.creator).exists():
            GroupMembership.objects.create(group=group, user=group.creator, role='admin')
            print(f"[FIXED] Creator {group.creator} added as admin to group '{group.name}' (ID: {group.id})")
            fixed += 1

if fixed == 0:
    print("Alle Gruppen sind korrekt: Jeder Ersteller ist als Admin-Mitglied eingetragen.")
else:
    print(f"Fertig! {fixed} Gruppen korrigiert.") 