-- AlterTable
ALTER TABLE `Media` ADD COLUMN `status` ENUM('PENDING', 'CONFIRMED') NOT NULL DEFAULT 'PENDING',
    MODIFY `cloudinaryUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Media_status_idx` ON `Media`(`status`);
