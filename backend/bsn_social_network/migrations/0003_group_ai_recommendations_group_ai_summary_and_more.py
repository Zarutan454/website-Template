# Generated by Django 5.0.2 on 2025-07-16 14:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bsn_social_network', '0002_post_privacy'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='ai_recommendations',
            field=models.JSONField(blank=True, default=list, help_text='AI-powered recommendations'),
        ),
        migrations.AddField(
            model_name='group',
            name='ai_summary',
            field=models.TextField(blank=True, help_text='AI-generated group summary', null=True),
        ),
        migrations.AddField(
            model_name='group',
            name='avatar_url',
            field=models.URLField(blank=True, help_text='URL to group avatar', null=True),
        ),
        migrations.AddField(
            model_name='group',
            name='banner_url',
            field=models.URLField(blank=True, help_text='URL to group banner', null=True),
        ),
        migrations.AddField(
            model_name='group',
            name='guidelines',
            field=models.TextField(blank=True, help_text='Group guidelines', null=True),
        ),
        migrations.AddField(
            model_name='group',
            name='join_questions',
            field=models.JSONField(blank=True, default=list, help_text='List of join questions'),
        ),
        migrations.AddField(
            model_name='group',
            name='pinned_post',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pinned_in_groups', to='bsn_social_network.post'),
        ),
        migrations.AddField(
            model_name='group',
            name='post_approval',
            field=models.BooleanField(default=False, help_text='Require admin/mod approval for posts'),
        ),
        migrations.AddField(
            model_name='group',
            name='report_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='group',
            name='tags',
            field=models.JSONField(blank=True, default=list, help_text='List of up to 5 tags'),
        ),
        migrations.AddField(
            model_name='group',
            name='type',
            field=models.CharField(choices=[('general', 'General'), ('buy_sell', 'Buy & Sell'), ('learning', 'Learning'), ('support', 'Support'), ('event', 'Event'), ('custom', 'Custom')], default='general', max_length=20),
        ),
        migrations.AlterField(
            model_name='groupmembership',
            name='role',
            field=models.CharField(choices=[('member', 'Member'), ('admin', 'Admin'), ('moderator', 'Moderator'), ('expert', 'Expert')], default='member', max_length=10),
        ),
    ]
