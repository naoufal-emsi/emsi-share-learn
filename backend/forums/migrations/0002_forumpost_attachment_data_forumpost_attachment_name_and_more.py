# Generated by Django 5.2.1 on 2025-05-31 01:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forums', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumpost',
            name='attachment_data',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='forumpost',
            name='attachment_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='forumpost',
            name='attachment_size',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='forumpost',
            name='attachment_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='forumtopic',
            name='attachment_data',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='forumtopic',
            name='attachment_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='forumtopic',
            name='attachment_size',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='forumtopic',
            name='attachment_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
