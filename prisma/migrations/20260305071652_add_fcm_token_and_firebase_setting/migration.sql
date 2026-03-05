-- AlterTable
ALTER TABLE "setting" ADD COLUMN     "firebase_service_account_json" TEXT;

-- AlterTable
ALTER TABLE "user_session" ADD COLUMN     "fcm_token" TEXT;
