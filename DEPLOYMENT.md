# Netlify Deployment Guide

## Prerequisites

Your app has been configured to use **Neon PostgreSQL** for Netlify deployment.

## Step-by-Step Deployment

### 1. Set Up Neon Database (Free)

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account
3. Click "Create a project"
4. Choose a project name (e.g., "hannes-meat-shop")
5. Select a region close to your users
6. Click "Create project"
7. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Update Local Environment

1. Open `.env` file
2. Replace `DATABASE_URL` with your Neon connection string
3. Save the file

### 3. Run Database Migration

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create database tables in Neon
npx prisma migrate deploy

# Or if you want to create a new migration:
npx prisma migrate dev --name init_neon
```

### 4. Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add these variables:
     - `DATABASE_URL`: Your Neon connection string
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
     - `NEXTAUTH_URL`: Your Netlify site URL (e.g., `https://your-site.netlify.app`)
     - `RESEND_API_KEY`: Your Resend API key
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set DATABASE_URL "your-neon-connection-string"
netlify env:set NEXTAUTH_SECRET "your-secret"
netlify env:set NEXTAUTH_URL "https://your-site.netlify.app"
netlify env:set RESEND_API_KEY "your-resend-key"

# Deploy
netlify deploy --prod
```

### 5. Verify Deployment

1. Visit your Netlify site URL
2. Test registration and login
3. Test password reset (email functionality)
4. Test buying/selling meat features

## Important Notes

### Database Migrations

- Always run `npx prisma migrate deploy` after schema changes
- Do NOT use `prisma migrate dev` in production
- Migrations are already included in your Git repository

### Environment Variables on Netlify

Make sure these are set in Netlify dashboard:

| Variable          | Description                       | Example                                                      |
| ----------------- | --------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`    | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth        | Generate with `openssl rand -base64 32`                      |
| `NEXTAUTH_URL`    | Full URL of your deployed site    | `https://your-site.netlify.app`                              |
| `RESEND_API_KEY`  | Resend API key for emails         | `re_xxxxx`                                                   |

### Troubleshooting

**Build fails with Prisma errors:**

- Make sure DATABASE_URL is set in Netlify environment variables
- Check that you ran `npx prisma generate` locally first

**Database connection errors:**

- Verify Neon connection string includes `?sslmode=require`
- Check that Neon project is active (free tier doesn't auto-sleep)

**NextAuth errors:**

- Make sure `NEXTAUTH_URL` matches your exact Netlify URL
- Ensure `NEXTAUTH_SECRET` is set and is a secure random string

**Email not sending:**

- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery status
- Add your domain in Resend for production emails

## Alternative: Deploy to Vercel

If you prefer Vercel over Netlify:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# (same variables as Netlify)
```

Vercel has better Next.js integration and both platforms support Neon PostgreSQL.

## Cost Estimate

- **Neon Database**: Free (up to 500MB)
- **Netlify Hosting**: Free (up to 100GB bandwidth)
- **Resend Emails**: Free (up to 100 emails/day)

All services have generous free tiers perfect for this application.
