# BSN Social Network - Story Feature Documentation

This document outlines the functionality of the Story feature in the BSN Social Network application.

## 1. Overview

The Story feature allows users to share temporary posts (images or videos) that are visible for 24 hours. This feature is designed to encourage spontaneous and frequent user engagement.

## 2. Data Models

Two main Django models support this feature: `Story` and `StoryView`.

### `Story` Model (`bsn_social_network/models.py`)

This model stores the core data for each story.

- `author`: A foreign key to the `User` who created the story.
- `media_url`: The URL to the image or video file.
- `caption`: An optional text caption for the story.
- `story_type`: The type of media ('image', 'video').
- `expires_at`: A timestamp indicating when the story will no longer be visible (typically 24 hours after creation).
- `created_at`: The creation timestamp.

### `StoryView` Model (`bsn_social_network/models.py`)

This model tracks which users have viewed a specific story. This is used to implement the "seen" status and the view counter.

- `story`: A foreign key to the `Story` that was viewed.
- `user`: A foreign key to the `User` who viewed the story.
- `viewed_at`: The timestamp when the story was viewed.

A unique constraint on `story` and `user` ensures that a view is only counted once per user per story.

## 3. API Endpoints

The Story functionality is managed through the `StoryViewSet` located in `bsn_social_network/views.py`. All endpoints are available under the `/api/stories/` path.

- `POST /api/stories/`: Creates a new story. Requires authentication. The request body should be `multipart/form-data` and include the `media` file and an optional `caption`.
- `GET /api/stories/my/`: Retrieves the current user's active stories.
- `GET /api/stories/following/`: Retrieves a list of active stories from users that the current user follows. The stories are grouped by author.
- `POST /api/stories/{story_id}/view/`: Marks a specific story as "viewed" by the current user. This creates a `StoryView` record.

## 4. Feature Logic

### Story Lifetime

Stories are automatically filtered in the backend to only show content created within the last 24 hours. The `expires_at` field facilitates this.

### View Counter

When a user views a story, a request is sent to the `view` endpoint. The backend creates a `StoryView` entry. The `StorySerializer` calculates the total number of views (`views_count`) for each story. This count is only intended to be displayed to the story's author in the frontend (`StoryViewer.tsx`). 