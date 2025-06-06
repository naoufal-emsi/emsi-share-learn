# Generated by Django 4.2.7 on 2025-05-24 14:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import resources.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('rooms', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('file', models.FileField(blank=True, null=True, upload_to=resources.models.resource_upload_path)),
                ('external_url', models.URLField(blank=True, null=True)),
                ('type', models.CharField(choices=[('pdf', 'PDF Document'), ('video', 'Video'), ('audio', 'Audio'), ('image', 'Image'), ('doc', 'Word Document'), ('ppt', 'PowerPoint'), ('excel', 'Excel'), ('zip', 'ZIP Archive'), ('link', 'External Link'), ('other', 'Other')], max_length=10)),
                ('visibility', models.CharField(choices=[('public', 'Public'), ('room_only', 'Room Only'), ('private', 'Private')], default='room_only', max_length=10)),
                ('file_size', models.BigIntegerField(blank=True, null=True)),
                ('download_count', models.IntegerField(default=0)),
                ('view_count', models.IntegerField(default=0)),
                ('is_featured', models.BooleanField(default=False)),
                ('tags', models.CharField(blank=True, max_length=500, null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='ResourceCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('icon', models.CharField(blank=True, max_length=50, null=True)),
                ('color', models.CharField(default='#3B82F6', max_length=7)),
            ],
            options={
                'verbose_name_plural': 'Resource Categories',
            },
        ),
        migrations.CreateModel(
            name='ResourceComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_edited', models.BooleanField(default=False)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='resources.resourcecomment')),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='resources.resource')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resource_comments', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ResourceAccess',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_type', models.CharField(choices=[('view', 'View'), ('download', 'Download'), ('share', 'Share')], max_length=10)),
                ('accessed_at', models.DateTimeField(auto_now_add=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='access_logs', to='resources.resource')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resource_accesses', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='resource',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resources', to='resources.resourcecategory'),
        ),
        migrations.AddField(
            model_name='resource',
            name='room',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resources', to='rooms.room'),
        ),
        migrations.AddField(
            model_name='resource',
            name='uploaded_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='uploaded_resources', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='ResourceRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)])),
                ('review', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='resources.resource')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resource_ratings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('resource', 'user')},
            },
        ),
    ]
