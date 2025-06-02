from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('forums', '0002_forumpost_attachment_data_forumpost_attachment_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumtopic',
            name='like_count',
            field=models.IntegerField(default=0),
        ),
        migrations.CreateModel(
            name='TopicLike',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('topic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='forums.forumtopic')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='topic_likes', to='users.User')),
            ],
            options={
                'unique_together': {('topic', 'user')},
            },
        ),
    ]