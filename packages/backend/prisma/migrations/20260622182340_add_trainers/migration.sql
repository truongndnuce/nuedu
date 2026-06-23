-- CreateTable
CREATE TABLE `Trainer` (
    `id` VARCHAR(191) NOT NULL,
    `nameVi` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `titleVi` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `bioVi` TEXT NOT NULL,
    `bioEn` TEXT NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `specialties` JSON NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
