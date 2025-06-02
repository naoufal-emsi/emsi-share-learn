from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('forums', '0003_forumtopic_like_count_topiclike'),
        ('users', '__first__'),  # Ensure users app migrations are applied first
    ]

    operations = [
        migrations.RunSQL(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'forums_topiclike'
                ) THEN
                    CREATE TABLE forums_topiclike (
                        id SERIAL PRIMARY KEY,
                        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                        topic_id INTEGER NOT NULL REFERENCES forums_forumtopic(id) ON DELETE CASCADE,
                        user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
                        CONSTRAINT forums_topiclike_topic_user_unique UNIQUE (topic_id, user_id)
                    );
                END IF;
            END
            $$;
            """,
            reverse_sql="DROP TABLE IF EXISTS forums_topiclike;"
        ),
    ]