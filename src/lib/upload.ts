import { r2 } from 'better-upload/server/helpers';

export const s3Client = r2({
  accountId: process.env.R2_ACCOUNT_ID as string,
  accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
});