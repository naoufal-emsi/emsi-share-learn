# Generated by Django 5.2.1 on 2025-06-02 07:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0005_resourcecategory_alter_resource_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='bookmark_count',
            field=models.IntegerField(default=0),
        ),
    ]
