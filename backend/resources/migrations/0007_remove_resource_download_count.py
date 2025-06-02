from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0006_resource_bookmark_count'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='resource',
            name='download_count',
        ),
    ]