# Deploying Sclay AI Proposal Generator to Vercel

## Quick Deployment Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy from this directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: sclay-ai-proposal-generator (or your choice)
# - Deploy? Yes
```

### 2. Integration Options

#### Option A: Subdomain (Recommended)
- Set up a custom subdomain like `proposals.yoursite.com`
- In Vercel dashboard: Settings → Domains → Add `proposals.yoursite.com`
- In your DNS: Add CNAME record pointing to your Vercel app URL

#### Option B: Path-based Integration
- Deploy with a custom path like `yoursite.com/proposals`
- Link to it from your existing website navigation

#### Option C: Iframe Embedding
- Embed the app in your existing site using an iframe:
```html
<iframe 
  src="https://your-app.vercel.app" 
  width="100%" 
  height="800px"
  frameborder="0">
</iframe>
```

### 3. Environment Variables
Make sure to set up these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Any other API keys or configuration

### 4. Custom Domain Setup (If using your own domain)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `proposals.yoursite.com`)
3. Update your DNS records as instructed by Vercel

### 5. Navigation Integration
Add a link in your existing website's navigation:
```html
<a href="https://your-proposal-app.vercel.app">AI Proposal Generator</a>
```

## Benefits of This Approach
- ✅ Zero server management
- ✅ Automatic deployments from git
- ✅ Global CDN
- ✅ HTTPS by default
- ✅ Easy custom domains
- ✅ Environment variable management
- ✅ No impact on existing website performance

## Next Steps After Deployment
1. Test the deployed app thoroughly
2. Set up your Supabase database (if not already done)
3. Configure authentication
4. Add the link to your existing website
5. Monitor usage via Vercel Analytics (optional) 