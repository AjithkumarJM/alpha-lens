# Deployment Guide

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to your project dashboard on Vercel
   - Navigate to Settings → Environment Variables
   - Add:
     - `VITE_ALPHA_VANTAGE_KEY` = your_alpha_vantage_key
     - `VITE_API_MODE` = live

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Auto Deploy from GitHub

1. Import your GitHub repository in Vercel dashboard
2. Set environment variables
3. Push to main branch → automatic deployment

---

## Netlify Deployment

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm i -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add:
     - `VITE_ALPHA_VANTAGE_KEY` = your_alpha_vantage_key
     - `VITE_API_MODE` = live

4. **Rebuild**
   - Trigger a new deploy from the Netlify dashboard

### Drag & Drop Deployment

1. Build locally: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder
4. Set environment variables in site settings
5. Trigger redeploy

---

## GitHub Pages Deployment

1. **Install gh-pages**
   ```bash
   npm i -D gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/indian-stock-market",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/indian-stock-market/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Set Environment Variables**
   - Create `.env.production` file
   - Add your API keys (they'll be embedded in the build)

---

## Environment Variables

### Required Variables

- `VITE_ALPHA_VANTAGE_KEY` - Get free key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

### Optional Variables

- `VITE_API_MODE` - `live` or `mock` (default: live)
- `VITE_USE_PROXY` - `true` or `false` (only for dev)
- `VITE_INDIAN_API_KEY` - If IndianAPI.in requires auth

### Security Note

⚠️ **IMPORTANT**: Vite environment variables starting with `VITE_` are embedded in the client bundle and visible to users. For production:

1. Use serverless functions to proxy API calls
2. Store sensitive keys on the server side
3. Implement rate limiting
4. Consider authentication

---

## Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatic

### Netlify

1. Go to Domain settings
2. Add custom domain
3. Configure DNS:
   - A Record: `75.2.60.5`
   - Or CNAME: `yoursite.netlify.app`
4. SSL certificate is automatic

---

## Performance Optimization

### Build Optimization

Already configured in `vite.config.js`:
- Automatic code splitting
- Tree shaking
- Minification
- Source maps for debugging

### CDN & Caching

Both Vercel and Netlify provide:
- Global CDN
- Automatic compression (Brotli/Gzip)
- Smart caching headers

### Image Optimization

If you add images:
```jsx
import logo from './assets/logo.png?url'
// Vite will optimize and hash the filename
```

---

## Monitoring & Analytics

### Add Google Analytics

1. Install package:
   ```bash
   npm i react-ga4
   ```

2. Initialize in `src/main.jsx`:
   ```javascript
   import ReactGA from 'react-ga4'
   
   ReactGA.initialize('G-XXXXXXXXXX')
   ReactGA.send('pageview')
   ```

### Add Sentry for Error Tracking

1. Install:
   ```bash
   npm i @sentry/react
   ```

2. Initialize in `src/main.jsx`:
   ```javascript
   import * as Sentry from '@sentry/react'
   
   Sentry.init({
     dsn: 'your-sentry-dsn',
     integrations: [new Sentry.BrowserTracing()],
     tracesSampleRate: 1.0,
   })
   ```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - run: npm ci
      
      - run: npm run build
        env:
          VITE_ALPHA_VANTAGE_KEY: ${{ secrets.VITE_ALPHA_VANTAGE_KEY }}
          
      - run: npm test
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Troubleshooting Deployment

### Build Fails

- Check Node version (should be 18+)
- Clear node_modules and reinstall
- Check for TypeScript errors (if using TS)
- Verify all imports are correct

### Environment Variables Not Working

- Ensure they start with `VITE_`
- Redeploy after adding new variables
- Check they're set in the hosting platform
- Verify values don't have quotes

### 404 on Refresh

For SPAs on Netlify, create `public/_redirects`:
```
/*    /index.html   200
```

For Vercel, create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### API Rate Limits in Production

- Implement server-side caching
- Add request queuing
- Use serverless functions
- Consider upgrading API tier

---

## Post-Deployment Checklist

- [ ] Test all features work in production
- [ ] Verify API keys are working
- [ ] Check mobile responsiveness
- [ ] Test dark mode
- [ ] Verify analytics are tracking
- [ ] Test error handling
- [ ] Check console for errors
- [ ] Verify SEO meta tags
- [ ] Test shareable links
- [ ] Monitor API usage

---

## Scaling Considerations

When moving to production at scale:

1. **Add Backend Proxy** - Hide API keys, handle rate limiting
2. **Database Layer** - Cache historical data server-side
3. **WebSocket Support** - Real-time price updates
4. **User Authentication** - Track watchlists, portfolios
5. **Premium APIs** - More reliable data sources
6. **Redis Caching** - Reduce API calls
7. **CDN for Assets** - Faster global load times
8. **Load Testing** - Verify app performance under load
