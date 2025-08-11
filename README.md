# ImgAltGen

AI-powered alt text generator for images with authentication and history tracking.

## Features

- Upload images and automatically generate descriptive alt text using Google's Gemini AI
- User authentication with Google OAuth
- History tracking of generated alt texts
- Clean, minimal UI built with Next.js and Tailwind CSS
- R2 storage for uploaded images

## Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Better Auth
- **Storage**: Cloudflare R2 with Better Upload
- **AI**: Google Gemini 2.5 Flash Lite with AI SDK
- **UI**: Tailwind CSS v4 + Shadcn UI
- **Deployment**: Vercel

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   DATABASE_URL="your-postgres-connection-string"
   BETTER_AUTH_SECRET="random-secret-string"
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   R2_ACCOUNT_ID="your-r2-account-id"
   R2_ACCESS_KEY_ID="your-r2-access-key"
   R2_SECRET_ACCESS_KEY="your-r2-secret-key"
   R2_BUCKET_NAME="your-r2-bucket-name"
   R2_PUBLIC_URL="your-r2-public-url"
   ```

4. Push database schema:
   ```bash
   pnpm prisma db push
   ```

5. Run development server:
   ```bash
   pnpm dev
   ```

## Usage

1. Upload an image (PNG, JPEG, or WebP - max 7MB)
2. The app automatically uploads it to R2 storage
3. AI generates descriptive alt text
4. Copy the generated text or view your history (requires login)

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint