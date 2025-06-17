CREATE TABLE user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE profile_settings (
  user_id INTEGER PRIMARY KEY,
  is_public BOOLEAN NOT NULL DEFAULT True,
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  CONSTRAINT fk_profile_settings_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE friendship (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_friendship_requester_id FOREIGN KEY (requester_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_friendship_receiver_id FOREIGN KEY (receiver_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT unique_friendship UNIQUE (requester_id, receiver_id)
);

CREATE TABLE group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id INTEGER NOT NULL,
  privacy VARCHAR(10) NOT NULL DEFAULT 'public',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_group_creator_id FOREIGN KEY (creator_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE group_membership (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_group_membership_group_id FOREIGN KEY (group_id) REFERENCES group(id) ON DELETE CASCADE,
  CONSTRAINT fk_group_membership_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT unique_group_membership UNIQUE (group_id, user_id)
);

CREATE TABLE post (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  group_id INTEGER NULL,
  content TEXT NOT NULL,
  media_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_post_author_id FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_group_id FOREIGN KEY (group_id) REFERENCES group(id) ON DELETE CASCADE
);

CREATE TABLE comment (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_comment_post_id FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_author_id FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE like (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NULL,
  comment_id INTEGER NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_like_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_like_post_id FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
  CONSTRAINT fk_like_comment_id FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id) WHERE (post_id IS NOT NULL),
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id) WHERE (comment_id IS NOT NULL),
  CONSTRAINT like_has_target CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE TABLE story (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  media_url VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_story_author_id FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE notification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL,
  reference_id INTEGER NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT False,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_notification_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE message (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NULL,
  group_id INTEGER NULL,
  content TEXT NOT NULL,
  media_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_message_sender_id FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_receiver_id FOREIGN KEY (receiver_id) REFERENCES user(id) ON DELETE SET_NULL,
  CONSTRAINT fk_message_group_id FOREIGN KEY (group_id) REFERENCES group(id) ON DELETE SET_NULL,
  CONSTRAINT message_has_recipient CHECK (receiver_id IS NOT NULL OR group_id IS NOT NULL)
);

CREATE TABLE achievement (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  reward VARCHAR(255) NOT NULL
);

CREATE TABLE user_achievement (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  unlocked_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_user_achievement_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_achievement_achievement_id FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE TABLE invite (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  inviter_id INTEGER NOT NULL,
  invitee_email VARCHAR(255) NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT False,
  created_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  CONSTRAINT fk_invite_inviter_id FOREIGN KEY (inviter_id) REFERENCES user(id) ON DELETE CASCADE
);