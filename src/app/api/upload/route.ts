import { S3Client } from '@aws-sdk/client-s3';
import {
  createUploadRouteHandler,
  route,
  type Router,
} from 'better-upload/server';

const s3 = new S3Client();

const router: Router = {
  client: s3,
  bucketName: 'imggenalt',
  routes: {
    demo: route({
      fileTypes: ['image/*'],
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);