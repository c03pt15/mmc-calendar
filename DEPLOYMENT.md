# MMC Calendar - Deployment Guide

This guide will help you deploy your MMC Calendar app online using various platforms.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Set up your database using the provided `database-schema.sql`
   - Populate with sample data using `populate-examples.sql`
   - Get your project URL and anon key from Settings > API

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Build Your App

Before deploying, build your app for production:

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables in Vercel dashboard

3. **Automatic Deployments:**
   - Connect your GitHub repository
   - Vercel will auto-deploy on every push

**Manual Setup:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in project settings
4. Deploy!

### Option 2: Netlify (Free & Easy)

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Manual Setup:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder
3. Add environment variables in Site Settings > Environment Variables
4. Your site is live!

### Option 3: GitHub Pages (Free)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch

### Option 4: Firebase Hosting (Free)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase:**
   ```bash
   firebase init hosting
   ```
   - Select your `dist` folder as public directory
   - Configure as single-page app: Yes

3. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

### Option 5: Surge.sh (Free)

1. **Install Surge:**
   ```bash
   npm install -g surge
   ```

2. **Deploy:**
   ```bash
   npm run build
   surge dist
   ```

## Environment Variables Setup

For each platform, you'll need to add these environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Platform-specific instructions:

**Vercel:**
- Project Settings > Environment Variables
- Add both variables for Production, Preview, and Development

**Netlify:**
- Site Settings > Environment Variables
- Add both variables

**GitHub Pages:**
- Repository Settings > Secrets and Variables > Actions
- Add as repository secrets
- Use in GitHub Actions workflow

**Firebase:**
- Project Settings > General > Your apps
- Add environment variables in hosting configuration

## Database Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup to complete

2. **Set up Database:**
   - Go to SQL Editor
   - Run the contents of `database-schema.sql`
   - Run the contents of `populate-examples.sql` (optional)

3. **Configure Row Level Security (RLS):**
   ```sql
   -- Enable RLS on tasks table
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   
   -- Create policy for public access (adjust as needed)
   CREATE POLICY "Allow public access" ON tasks FOR ALL USING (true);
   ```

## Custom Domain (Optional)

Most platforms support custom domains:

1. **Vercel:** Project Settings > Domains
2. **Netlify:** Site Settings > Domain Management
3. **Firebase:** Hosting > Add custom domain

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working:**
   - Ensure variables start with `VITE_`
   - Restart your development server after adding variables
   - Check platform-specific environment variable setup

2. **Supabase Connection Issues:**
   - Verify your URL and key are correct
   - Check Supabase project is active
   - Ensure RLS policies allow access

3. **Build Errors:**
   - Run `npm run build` locally first
   - Check for TypeScript errors
   - Ensure all dependencies are installed

4. **CORS Issues:**
   - Add your domain to Supabase allowed origins
   - Check Supabase project settings

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use platform-specific secret management

2. **Supabase Security:**
   - Configure proper RLS policies
   - Use service role key only on server-side
   - Regularly rotate API keys

3. **HTTPS:**
   - All major platforms provide HTTPS by default
   - Ensure your custom domain uses HTTPS

## Monitoring & Analytics

Consider adding:
- **Vercel Analytics:** Built-in performance monitoring
- **Google Analytics:** User behavior tracking
- **Sentry:** Error monitoring
- **Supabase Dashboard:** Database monitoring

## Next Steps

After deployment:
1. Test all functionality on the live site
2. Set up monitoring and analytics
3. Configure custom domain if desired
4. Set up automatic deployments
5. Consider adding CI/CD pipeline

## Support

If you encounter issues:
1. Check platform-specific documentation
2. Review Supabase logs
3. Test locally with production environment variables
4. Check browser console for errors
