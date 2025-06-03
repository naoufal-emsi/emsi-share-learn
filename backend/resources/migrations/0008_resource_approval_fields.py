from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0007_remove_resource_download_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='approved', max_length=10),
        ),
        migrations.AddField(
            model_name='resource',
            name='rejection_reason',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='resource',
            name='reviewed_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_resources', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='resource',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]