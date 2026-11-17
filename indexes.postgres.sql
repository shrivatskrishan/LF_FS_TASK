-- Run once against the live database. sequelize.sync({ alter: false }) will not create these.

-- Post likes: one row per user and post when comment_id is null.
-- The existing UNIQUE (user_id, post_id, comment_id) allows many rows
-- when comment_id is null, because Postgres treats each null as different.
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_post_unique
ON likes (user_id, post_id)
WHERE comment_id IS NULL;

-- Trending reads: WHERE created_at >= <7 days ago> ORDER BY likes_count DESC LIMIT 20.
-- A partial index cannot use NOW() or a rolling 7-day window. That expression
-- is not immutable, so Postgres rejects it. This composite index supports the
-- date filter and the likes sort.
CREATE INDEX IF NOT EXISTS posts_trending_created_likes
ON posts (created_at DESC, likes_count DESC);
