-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ResellerStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "PlatformStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DEFAULT', 'PACKAGE', 'CUSTOM_COMMENTS', 'POLL', 'SUBSCRIPTIONS');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "ApiProviderStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYPAL', 'CRYPTOMUS', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentGatewayStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PROCESSING', 'COMPLETED', 'SUCCESS', 'PARTIAL', 'ERROR', 'CANCELED');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'ERROR', 'CANCELED', 'PAYMENT');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'PENDING', 'ANSWERED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'DEPOSIT', 'TICKET', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AdminNotificationType" AS ENUM ('NEW_USER', 'NEW_ORDER', 'ORDER_UPDATE', 'NEW_DEPOSIT', 'DEPOSIT_UPDATE', 'NEW_TICKET', 'TICKET_UPDATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RedeemStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "ImagekitApiStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "profile_imagekit_url" TEXT,
    "apikey" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "webhook_url" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device" TEXT,
    "location" TEXT,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "email_order_updates" BOOLEAN NOT NULL DEFAULT true,
    "email_deposit_updates" BOOLEAN NOT NULL DEFAULT true,
    "email_ticket_updates" BOOLEAN NOT NULL DEFAULT true,
    "email_marketing" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reseller" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "status" "ResellerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_imagekit_url" TEXT,
    "status" "PlatformStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setting" (
    "id" SERIAL NOT NULL,
    "site_name" TEXT NOT NULL,
    "favicon_imagekit_url" TEXT,
    "logo_imagekit_url" TEXT,
    "instagram_url" TEXT,
    "facebook_url" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "telegram" TEXT,
    "imagekit_url" TEXT,
    "imagekit_publickey" TEXT,
    "imagekit_privatekey" TEXT,
    "google_analytic_code" TEXT,
    "google_search_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reseller_fee" DECIMAL(10,2) NOT NULL DEFAULT 100000,
    "pusher_app_cluster" TEXT,
    "pusher_app_id" TEXT,
    "pusher_app_key" TEXT,
    "pusher_app_secret" TEXT,
    "plausible_domain" TEXT,
    "plausible_api_key" TEXT,

    CONSTRAINT "setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagekit_api" (
    "id" SERIAL NOT NULL,
    "url_endpoint" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "status" "ImagekitApiStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imagekit_api_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imagekit_url_banner" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "id_platform" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" SERIAL NOT NULL,
    "id_category" INTEGER NOT NULL,
    "sid" TEXT,
    "id_api_provider" INTEGER,
    "name" TEXT NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "price_api" DECIMAL(10,4) NOT NULL,
    "price_sale" DECIMAL(10,4) NOT NULL,
    "price_reseller" DECIMAL(10,4) NOT NULL,
    "refill" BOOLEAN NOT NULL DEFAULT false,
    "type" "ServiceType" NOT NULL DEFAULT 'DEFAULT',
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "balance" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "status" "ApiProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway" (
    "id" SERIAL NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "api_config" JSONB NOT NULL,
    "status" "PaymentGatewayStatus" NOT NULL DEFAULT 'ACTIVE',
    "min_deposit" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_api_provider" INTEGER,
    "id_service" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "price_api" DECIMAL(10,4) NOT NULL,
    "price_sale" DECIMAL(10,4) NOT NULL,
    "price_seller" DECIMAL(10,4) NOT NULL,
    "remains" INTEGER,
    "start_count" INTEGER,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "refill" BOOLEAN NOT NULL DEFAULT false,
    "runs" INTEGER,
    "interval" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "pid" TEXT,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "detail_transaction" JSONB NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "NewsStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" SERIAL NOT NULL,
    "name_discount" TEXT NOT NULL,
    "min_transaction" DECIMAL(10,2) NOT NULL,
    "max_transaction" DECIMAL(10,2) NOT NULL,
    "type" "DiscountType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "expired_date" TIMESTAMP(3) NOT NULL,
    "max_used" INTEGER NOT NULL,
    "status" "DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "discount_max_get" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_usage" (
    "id" SERIAL NOT NULL,
    "id_discount" INTEGER NOT NULL,
    "id_users" INTEGER NOT NULL,
    "id_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reedem_code" (
    "id" SERIAL NOT NULL,
    "name_code" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "expired_date" TIMESTAMP(3) NOT NULL,
    "get_balance" DECIMAL(10,2) NOT NULL,
    "total_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RedeemStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "reedem_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reedem_used" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_redeem_code" INTEGER NOT NULL,

    CONSTRAINT "reedem_used_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "AdminNotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_page" (
    "id" SERIAL NOT NULL,
    "home_title" TEXT,
    "home_desc" TEXT,
    "service_title" TEXT,
    "service_desc" TEXT,
    "term_title" TEXT,
    "term_desc" TEXT,
    "about_title" TEXT,
    "about_desc" TEXT,
    "forget_title" TEXT,
    "forget_desc" TEXT,
    "login_title" TEXT,
    "login_desc" TEXT,
    "privacy_title" TEXT,
    "privacy_desc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seo_title" TEXT,
    "desc_seo" TEXT,
    "keyword" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_post" (
    "id" SERIAL NOT NULL,
    "id_article_category" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "banner_imagekit_upload_url" TEXT,
    "content" JSONB NOT NULL,
    "seo_title" TEXT,
    "desc_seo" TEXT,
    "keyword" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'ACTIVE',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_api" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "balance" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "markup_price_pecentase" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_api_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_sms" (
    "id" SERIAL NOT NULL,
    "pid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sms" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "project_id" TEXT NOT NULL,
    "cost" DECIMAL(10,4) NOT NULL,
    "cost_sale" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "total_count" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_sms" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_country_sms" INTEGER NOT NULL,
    "id_product_sms" INTEGER NOT NULL,
    "price_api_sms" DECIMAL(10,4) NOT NULL,
    "price_sale" DECIMAL(10,4) NOT NULL,
    "invoice" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status_order" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "sms_otp_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_sms" (
    "id" SERIAL NOT NULL,
    "pid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_sms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_apikey_key" ON "user"("apikey");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_token_key" ON "user_session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_id_user_key" ON "notification_preferences"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_id_user_key" ON "reseller"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "platform_slug_key" ON "platform"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "slider_slug_key" ON "slider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "api_provider_code_key" ON "api_provider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "order_invoice_number_key" ON "order"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "reedem_code_name_code_key" ON "reedem_code"("name_code");

-- CreateIndex
CREATE UNIQUE INDEX "article_category_slug_key" ON "article_category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_post_slug_key" ON "article_post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "order_sms_invoice_key" ON "order_sms"("invoice");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller" ADD CONSTRAINT "reseller_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_id_platform_fkey" FOREIGN KEY ("id_platform") REFERENCES "platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_id_api_provider_fkey" FOREIGN KEY ("id_api_provider") REFERENCES "api_provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_id_api_provider_fkey" FOREIGN KEY ("id_api_provider") REFERENCES "api_provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_id_discount_fkey" FOREIGN KEY ("id_discount") REFERENCES "discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_id_users_fkey" FOREIGN KEY ("id_users") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reedem_used" ADD CONSTRAINT "reedem_used_id_redeem_code_fkey" FOREIGN KEY ("id_redeem_code") REFERENCES "reedem_code"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reedem_used" ADD CONSTRAINT "reedem_used_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_post" ADD CONSTRAINT "article_post_id_article_category_fkey" FOREIGN KEY ("id_article_category") REFERENCES "article_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sms" ADD CONSTRAINT "product_sms_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country_sms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_sms" ADD CONSTRAINT "order_sms_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_sms" ADD CONSTRAINT "order_sms_id_country_sms_fkey" FOREIGN KEY ("id_country_sms") REFERENCES "country_sms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_sms" ADD CONSTRAINT "order_sms_id_product_sms_fkey" FOREIGN KEY ("id_product_sms") REFERENCES "product_sms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
