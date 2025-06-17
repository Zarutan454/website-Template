# BSN Social Network

A Django-based social network platform with features for user interactions, content sharing, and community building.

## Database Schema

The application consists of the following main models:

### User and Profile Tables
- `User`: Core authentication model
- `ProfileSettings`: User preferences and settings
- `Friendship`: User connections and friendship status

### Group Tables
- `Group`: Communities and interest groups
- `GroupMembership`: User participation in groups with roles

### Content Tables
- `Post`: User-generated content
- `Comment`: Responses to posts
- `Like`: User interactions with posts and comments
- `Story`: Temporary user updates

### Additional Tables
- `Notification`: User alerts and notifications
- `Message`: Private and group communication
- `Achievement`: Platform gamification features 
- `UserAchievement`: Tracking user progress with achievements
- `Invite`: Platform invitation system

## Setup and Installation

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Configure database settings in settings.py
4. Run migrations: `python manage.py migrate`
5. Create a superuser: `python manage.py createsuperuser`
6. Run the development server: `python manage.py runserver`
