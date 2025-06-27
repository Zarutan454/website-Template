# BSN Website Deployment Guide

This document outlines the deployment process for the BSN website template.

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Access to a hosting platform (Vercel, Netlify, AWS, etc.)
- Git repository access

## Build Process

### Local Build

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Preview the build locally:
   ```bash
   npm run preview
   ```

The build output will be in the `dist` directory, which contains the static files that can be deployed to any hosting service.

## Deployment Options

### 1. Vercel Deployment

Vercel is recommended for React applications due to its simplicity and performance optimizations.

#### Steps:

1. Create an account on [Vercel](https://vercel.com)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy the project:
   ```bash
   vercel
   ```

5. For production deployment:
   ```bash
   vercel --prod
   ```

### 2. Netlify Deployment

Netlify is another excellent option for deploying React applications.

#### Steps:

1. Create an account on [Netlify](https://netlify.com)
2. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

3. Login to Netlify:
   ```bash
   netlify login
   ```

4. Deploy the project:
   ```bash
   netlify deploy
   ```

5. For production deployment:
   ```bash
   netlify deploy --prod
   ```

### 3. GitHub Pages Deployment

For GitHub Pages deployment, you'll need to modify the `vite.config.js` file:

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/repository-name/', // Replace with your repository name
});
```

#### Steps:

1. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add deployment scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### 4. Docker Deployment

For containerized deployment:

#### Steps:

1. Create a `Dockerfile` in the project root:
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Build the Docker image:
   ```bash
   docker build -t bsn-website .
   ```

3. Run the Docker container:
   ```bash
   docker run -p 8080:80 bsn-website
   ```

## Environment Variables

For environment-specific configurations, create a `.env` file:

```
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Access these variables in your code using:

```js
const apiUrl = import.meta.env.VITE_API_URL;
```

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment Verification

After deployment, verify:

1. All pages load correctly
2. All links work properly
3. Forms submit correctly
4. Animations and interactive elements work as expected
5. The site is responsive on different devices
6. Performance metrics are acceptable (use Lighthouse)

## Rollback Procedure

If issues are detected after deployment:

### Vercel/Netlify:
- Go to the deployment dashboard
- Select a previous successful deployment
- Click "Rollback"

### Manual Rollback:
- Revert to the previous commit
- Rebuild and redeploy

## Monitoring and Analytics

Consider adding:

1. Google Analytics or Plausible for user analytics
2. Sentry for error tracking
3. Uptime monitoring with tools like UptimeRobot

## Security Considerations

1. Ensure all API keys are stored as environment variables
2. Enable HTTPS for all deployments
3. Set appropriate Content Security Policy (CSP) headers
4. Regularly update dependencies for security patches

## Performance Optimization

1. Enable caching for static assets
2. Use a CDN for global distribution
3. Optimize images and assets
4. Enable Gzip/Brotli compression 