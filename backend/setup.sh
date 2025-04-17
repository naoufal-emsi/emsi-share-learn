
#!/bin/bash

# Create a virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Create postgres database (assumes PostgreSQL is installed)
echo "Creating database..."
psql -U postgres -c "CREATE DATABASE emsi_share WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';"

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create admin user
echo "Creating admin user..."
python create_admin.py

# Create sample data
echo "Creating sample data..."
python manage.py loaddata initial_data.json

echo "Setup complete!"
echo "You can now run the server with: python manage.py runserver"
