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
                
                # Calculate resource stats by proper file type categorization
                resource_stats = {
                    'documents': {'count': 0, 'size_mb': 0},
                    'code': {'count': 0, 'size_mb': 0},
                    'videos': {'count': 0, 'size_mb': 0},
                    'images': {'count': 0, 'size_mb': 0},
                    'other': {'count': 0, 'size_mb': 0}
                }
                
                try:
                    # Documents: PDF, Word, Excel, PowerPoint, ZIP, etc.
                    cursor.execute("""
                        SELECT COUNT(*), COALESCE(SUM(file_size), 0)
                        FROM resources_resource 
                        WHERE file_name ~* '\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|txt|rtf|odt|ods|odp)$'
                    """)
                    doc_result = cursor.fetchone()
                    if doc_result:
                        resource_stats['documents'] = {
                            'count': doc_result[0],
                            'size_mb': round((doc_result[1] or 0) / (1024**2), 2)
                        }
                    
                    # Code files: JS, Python, Java, C/C++, PHP, SQL, JSON, etc.
                    cursor.execute("""
                        SELECT COUNT(*), COALESCE(SUM(file_size), 0)
                        FROM resources_resource 
                        WHERE file_name ~* '\.(js|jsx|ts|tsx|py|java|c|cpp|h|hpp|php|sql|json|xml|html|css|scss|sass|rb|go|rs|kt|swift|dart|yaml|yml|sh|bat|ps1)$'
                    """)
                    code_result = cursor.fetchone()
                    if code_result:
                        resource_stats['code'] = {
                            'count': code_result[0],
                            'size_mb': round((code_result[1] or 0) / (1024**2), 2)
                        }
                    
                    # Videos: MP4, AVI, MOV, etc.
                    cursor.execute("""
                        SELECT COUNT(*), COALESCE(SUM(file_size), 0)
                        FROM resources_resource 
                        WHERE file_name ~* '\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|mpg|mpeg)$'
                    """)
                    video_result = cursor.fetchone()
                    if video_result:
                        resource_stats['videos'] = {
                            'count': video_result[0],
                            'size_mb': round((video_result[1] or 0) / (1024**2), 2)
                        }
                    
                    # Images: JPG, PNG, GIF, etc.
                    cursor.execute("""
                        SELECT COUNT(*), COALESCE(SUM(file_size), 0)
                        FROM resources_resource 
                        WHERE file_name ~* '\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico)$'
                    """)
                    image_result = cursor.fetchone()
                    if image_result:
                        resource_stats['images'] = {
                            'count': image_result[0],
                            'size_mb': round((image_result[1] or 0) / (1024**2), 2)
                        }
                    
                    # Other files (everything else)
                    cursor.execute("""
                        SELECT COUNT(*), COALESCE(SUM(file_size), 0)
                        FROM resources_resource 
                        WHERE NOT (file_name ~* '\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|txt|rtf|odt|ods|odp|js|jsx|ts|tsx|py|java|c|cpp|h|hpp|php|sql|json|xml|html|css|scss|sass|rb|go|rs|kt|swift|dart|yaml|yml|sh|bat|ps1|mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|mpg|mpeg|jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico)$')
                    """)
                    other_result = cursor.fetchone()
                    if other_result:
                        resource_stats['other'] = {
                            'count': other_result[0],
                            'size_mb': round((other_result[1] or 0) / (1024**2), 2)
                        }
                        
                except Exception as e:
                    print(f"Error calculating resource stats: {e}")
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