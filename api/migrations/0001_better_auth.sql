CREATE TABLE `user` (
    `id` TEXT PRIMARY KEY NOT NULL,
    `name` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `emailVerified` INTEGER NOT NULL DEFAULT 0,
    `image` TEXT,
    `createdAt` INTEGER NOT NULL,
    `updatedAt` INTEGER NOT NULL,
    CONSTRAINT `user_email_unique` UNIQUE (`email`)
);

CREATE TABLE `session` (
    `id` TEXT PRIMARY KEY NOT NULL,
    `expiresAt` INTEGER NOT NULL,
    `token` TEXT NOT NULL,
    `createdAt` INTEGER NOT NULL,
    `updatedAt` INTEGER NOT NULL,
    `ipAddress` TEXT,
    `userAgent` TEXT,
    `userId` TEXT NOT NULL,
    CONSTRAINT `session_token_unique` UNIQUE (`token`),
    CONSTRAINT `session_user_fk`
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE
);

CREATE TABLE `account` (
    `id` TEXT PRIMARY KEY NOT NULL,
    `accountId` TEXT NOT NULL,
    `providerId` TEXT NOT NULL,
    `userId` TEXT NOT NULL,
    `accessToken` TEXT,
    `refreshToken` TEXT,
    `idToken` TEXT,
    `accessTokenExpiresAt` INTEGER,
    `refreshTokenExpiresAt` INTEGER,
    `scope` TEXT,
    `password` TEXT,
    `createdAt` INTEGER NOT NULL,
    `updatedAt` INTEGER NOT NULL,
    CONSTRAINT `account_user_fk`
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE
);

CREATE TABLE `verification` (
    `id` TEXT PRIMARY KEY NOT NULL,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` INTEGER NOT NULL,
    `createdAt` INTEGER,
    `updatedAt` INTEGER
);

CREATE INDEX `session_userId_idx`
    ON `session` (`userId`);

CREATE INDEX `account_userId_idx`
    ON `account` (`userId`);


CREATE INDEX `verification_identifier_idx`
    ON `verification` (`identifier`);