CREATE TABLE `users` (
  `id` integer PRIMARY KEY,
  `username` varchar(255),
  `name` varchar(255),
  `email` varchar(255),
  `password` varchar(255),
  `profile` varchar(255)
);

CREATE TABLE `setting` (
  `theme` varchar(255),
  `lang` varchar(255),
  `notification` boolean,
  `synch` integer
);

CREATE TABLE `place` (
  `id` integer PRIMARY KEY,
  `title` varchar(255),
  `desc` text,
  `lat` number,
  `long` number,
  `province_id` integer,
  `category_id` integer
);

CREATE TABLE `image_place` (
  `id` integer PRIMARY KEY,
  `place_id` integer,
  `image` varchar(255),
  `image1` varchar(255),
  `image2` varchar(255),
  `image3` varchar(255),
  `image4` varchar(255)
);

CREATE TABLE `video_place` (
  `id` integer PRIMARY KEY,
  `place_id` integer,
  `video` varchar(255)
);

CREATE TABLE `review` (
  `id` integer PRIMARY KEY,
  `user_id` integer,
  `place_id` integer,
  `note` integer,
  `comment` text
);

CREATE TABLE `favorites` (
  `id` integer PRIMARY KEY,
  `user_id` integer,
  `place_id` integer
);

CREATE TABLE `category` (
  `id` integer PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `province` (
  `id` integer PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `tag` (
  `id` integer PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `tag_place` (
  `id` integer PRIMARY KEY,
  `place_id` integer,
  `tag_id` integer
);

ALTER TABLE `review` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `review` ADD FOREIGN KEY (`place_id`) REFERENCES `place` (`id`);

ALTER TABLE `favorites` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `favorites` ADD FOREIGN KEY (`place_id`) REFERENCES `place` (`id`);

ALTER TABLE `image_place` ADD FOREIGN KEY (`place_id`) REFERENCES `place` (`id`);

ALTER TABLE `video_place` ADD FOREIGN KEY (`place_id`) REFERENCES `place` (`id`);

ALTER TABLE `tag_place` ADD FOREIGN KEY (`place_id`) REFERENCES `place` (`id`);

ALTER TABLE `tag_place` ADD FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`);

ALTER TABLE `place` ADD FOREIGN KEY (`province_id`) REFERENCES `province` (`id`);

ALTER TABLE `place` ADD FOREIGN KEY (`category_id`) REFERENCES `category` (`id`);
