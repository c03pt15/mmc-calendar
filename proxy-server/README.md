# MMC Calendar Proxy Server

A CORS proxy server to bypass corporate network restrictions for Supabase API calls.

## Setup

1. **Install dependencies:**
   ```bash
   cd proxy-server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your Supabase URL and anon key
   ```

3. **Run the server:**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

## Deployment Options

### Option 1: Deploy to Vercel
1. Create a new Vercel project
2. Set the root directory to `proxy-server`
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Deploy to Railway
1. Connect your GitHub repo to Railway
2. Set the root directory to `proxy-server`
3. Add environment variables
4. Deploy

### Option 3: Deploy to Heroku
1. Create a new Heroku app
2. Set the buildpack to Node.js
3. Add environment variables
4. Deploy

## Usage

Once deployed, update your frontend to use the proxy:

```typescript
// In src/supabaseClient.ts
const supabaseUrl = 'https://your-proxy-domain.com/api';
const supabaseAnonKey = 'your_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## How It Works

- Receives requests at `/api/*`
- Proxies them to Supabase at `/rest/v1/*`
- Adds proper CORS headers
- Handles preflight OPTIONS requests
- Logs all requests for debugging

## Testing

Visit `https://your-proxy-domain.com/health` to verify the server is running.
