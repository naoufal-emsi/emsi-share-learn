from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_user_role'),
        ('resources', '0007_remove_resource_download_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='is_classwork',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='StudentAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer_text', models.TextField()),
                ('file_data', models.BinaryField(blank=True, null=True)),
                ('file_name', models.CharField(blank=True, max_length=255, null=True)),
                ('file_type', models.CharField(blank=True, max_length=100, null=True)),
                ('file_size', models.BigIntegerField(blank=True, null=True)),
                ('score', models.FloatField(blank=True, null=True)),
                ('feedback', models.TextField(blank=True, null=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_answers', to='resources.resource')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submitted_answers', to='users.user')),
            ],
            options={
                'ordering': ['-submitted_at'],
                'unique_together': {('student', 'resource')},
            },
        ),
    ]