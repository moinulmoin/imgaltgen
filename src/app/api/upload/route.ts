import { auth } from "@/lib/auth";
import { s3Client } from "@/lib/upload";
import {
  createUploadRouteHandler,
  route,
  UploadFileError,
  type Router
} from "better-upload/server";

const router: Router = {
  client: s3Client,
  bucketName: process.env.R2_BUCKET_NAME as string,
  routes: {
    image: route({
      fileTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
      maxFileSize: 1024 * 1024 * 7,
      onBeforeUpload: async ({ req, file, clientMetadata }) => {
        const user = await auth.api.getSession({ headers: req.headers });
        if (!user) {
          throw new UploadFileError("Not logged in!");
        }
      },
    })
  }
};

export const { POST } = createUploadRouteHandler(router);