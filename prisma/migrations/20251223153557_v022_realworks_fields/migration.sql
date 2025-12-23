-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "realworksAfdeling" TEXT,
ADD COLUMN     "realworksBaseUrl" TEXT,
ADD COLUMN     "realworksEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "realworksLastSyncAt" TIMESTAMP(3),
ADD COLUMN     "realworksLastSyncStatus" TEXT;
