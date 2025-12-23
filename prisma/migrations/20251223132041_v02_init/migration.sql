-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandPrimary" TEXT NOT NULL DEFAULT '#1a73e8',
    "brandAccent" TEXT NOT NULL DEFAULT '#34a853',
    "brandBackground" TEXT NOT NULL DEFAULT '#0b1020',
    "brandText" TEXT NOT NULL DEFAULT '#ffffff',
    "realworksToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "streamKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 1920,
    "height" INTEGER NOT NULL DEFAULT 1080,
    "secondsPerItem" INTEGER NOT NULL DEFAULT 8,
    "publishedVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectCache" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "objectCode" TEXT NOT NULL,
    "afdelingCode" TEXT,
    "status" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "priceLine" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "imageUrl" TEXT,
    "updatedAtISO" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_streamKey_key" ON "Stream"("streamKey");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectCache_tenantId_objectCode_key" ON "ObjectCache"("tenantId", "objectCode");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectCache" ADD CONSTRAINT "ObjectCache_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
