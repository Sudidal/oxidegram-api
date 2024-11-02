CREATE OR REPLACE FUNCTION push_notif_to_followers(user_id BIGINT, notif_id BIGINT) RETURNS TEXT AS $$ 
  DECLARE 
    follower RECORD;
  BEGIN
    FOR follower IN SELECT "B" AS follower_id FROM "_FollowedToFollower" WHERE "A" = (user_id) LOOP
      INSERT INTO "NotificationsOnProfiles" ("notificationId", "profileId") VALUES (notif_id, follower.follower_id);
    END LOOP;
    RETURN 'nice';
  END;
$$ LANGUAGE plpgsql