from django.db import models, connection
from django.conf import settings

class PlatformSettings(models.Model):
    """
    Stores platform-wide settings
    """
    platform_name = models.CharField(max_length=100, default="EMSI Share")
    logo = models.TextField(null=True, blank=True)  # Base64 encoded logo
    
    # Page size settings
    resources_per_page = models.IntegerField(default=20)
    forum_posts_per_page = models.IntegerField(default=15)
    events_per_page = models.IntegerField(default=10)
    users_per_page = models.IntegerField(default=25)
    
    # General settings
    enable_registration = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    public_profiles = models.BooleanField(default=True)
    
    # Security settings
    password_policy = models.BooleanField(default=True)
    session_timeout = models.BooleanField(default=True)
    
    # Singleton pattern - only one settings object
    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(id=1)
        return settings
    
    def __str__(self):
        return f"Platform Settings: {self.platform_name}"

class DatabaseStats(models.Model):
    """
    Tracks when stats were last calculated
    """
    last_updated = models.DateTimeField(auto_now=True)
    
    @classmethod
    def get_real_stats(cls):
        """Calculate real database statistics from PostgreSQL"""
        try:
            with connection.cursor() as cursor:
                # Get database size
                cursor.execute("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as db_size,
                           pg_database_size(current_database()) as db_size_bytes
                """)
                db_result = cursor.fetchone()
                
                # Count records in main tables
                stats = {
                    'users': 0,
                    'events': 0,
                    'resources': 0,
                    'forum_topics': 0,
                    'forum_posts': 0
                }
                
                # Count users
                try:
                    cursor.execute("SELECT COUNT(*) FROM users_user")
                    stats['users'] = cursor.fetchone()[0]
                except:
                    pass
                
                # Count events
                try:
                    cursor.execute("SELECT COUNT(*) FROM events_event")
                    stats['events'] = cursor.fetchone()[0]
                except:
                    pass
                
                # Count resources
                try:
                    cursor.execute("SELECT COUNT(*) FROM resources_resource")
                    stats['resources'] = cursor.fetchone()[0]
                except:
                    pass
                
                # Count forum topics
                try:
                    cursor.execute("SELECT COUNT(*) FROM forums_forumtopic")
                    stats['forum_topics'] = cursor.fetchone()[0]
                except:
                    pass
                
                # Count forum posts
                try:
                    cursor.execute("SELECT COUNT(*) FROM forums_forumpost")
                    stats['forum_posts'] = cursor.fetchone()[0]
                except:
                    pass
                
                # Calculate resource sizes by type
                resource_stats = {}
                try:
                    cursor.execute("""
                        SELECT 
                            type,
                            COUNT(*) as count,
                            COALESCE(SUM(file_size), 0) as total_size
                        FROM resources_resource 
                        WHERE file_size IS NOT NULL
                        GROUP BY type
                    """)
                    for type_name, count, total_size in cursor.fetchall():
                        resource_stats[type_name] = {
                            'count': count,
                            'size_mb': round((total_size or 0) / (1024**2), 2)
                        }
                    
                    # Calculate documents by file extensions (json, python, pdf, zip, javascript)
                    cursor.execute("""
                        SELECT 
                            COUNT(*) as count,
                            COALESCE(SUM(file_size), 0) as total_size
                        FROM resources_resource 
                        WHERE file_size IS NOT NULL
                        AND (file_name ILIKE '%.json' 
                             OR file_name ILIKE '%.py' 
                             OR file_name ILIKE '%.pdf' 
                             OR file_name ILIKE '%.zip' 
                             OR file_name ILIKE '%.js'
                             OR file_name ILIKE '%.jsx'
                             OR file_name ILIKE '%.ts'
                             OR file_name ILIKE '%.tsx')
                    """)
                    doc_result = cursor.fetchone()
                    if doc_result:
                        resource_stats['document'] = {
                            'count': doc_result[0],
                            'size_mb': round((doc_result[1] or 0) / (1024**2), 2)
                        }
                except:
                    pass
                
                # Convert database size
                db_size_gb = (db_result[1] / (1024**3)) if db_result and db_result[1] else 0
                
                return {
                    'database_size': {
                        'size_pretty': db_result[0] if db_result and db_result[0] else '0 bytes',
                        'size_gb': round(db_size_gb, 2)
                    },
                    'record_counts': stats,
                    'resource_types': resource_stats
                }
        except Exception as e:
            print(f"Error calculating database stats: {e}")
            return {
                'database_size': {'size_pretty': 'Error', 'size_gb': 0},
                'record_counts': {'users': 0, 'events': 0, 'resources': 0, 'forum_topics': 0, 'forum_posts': 0},
                'resource_types': {}
            }
    
    @classmethod
    def get_stats(cls):
        """Get real-time database statistics"""
        # Update timestamp
        stats, created = cls.objects.get_or_create(id=1)
        stats.save()
        
        # Return real stats
        return cls.get_real_stats()
    
    def __str__(self):
        return f"Database Stats (Last Updated: {self.last_updated})"