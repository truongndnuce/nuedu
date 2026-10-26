-- AlterTable
ALTER TABLE `Trainer` ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `headlineVi` VARCHAR(191) NULL,
    ADD COLUMN `headlineEn` VARCHAR(191) NULL,
    ADD COLUMN `contentVi` LONGTEXT NULL,
    ADD COLUMN `contentEn` LONGTEXT NULL,
    ADD COLUMN `facebookUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Trainer_slug_key` ON `Trainer`(`slug`);
