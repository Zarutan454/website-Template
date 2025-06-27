
export interface Media {
  id: string;
  url: string;
  type: "image" | "video" | "file";
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  authorId?: string;
  created_at?: string; // Adding for backward compatibility
  post_id?: string;
  media_url?: string;
  caption?: string;
  album_id?: string;
  metadata?: {
    cameraMake?: string;
    cameraModel?: string;
    exposureTime?: string;
    fNumber?: number;
    iso?: number;
    focalLength?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    [key: string]: unknown;
  };
}

export interface SavedPostItem {
  post_id: string;
  posts: {
    id: string;
    media_url: string;
    media_type: string;
  };
}

export interface AlbumType {
  id: string;
  title: string;
  description?: string;
  cover_url: string;
  user_id: string;
  photo_count: number;
  created_at: string;
}
