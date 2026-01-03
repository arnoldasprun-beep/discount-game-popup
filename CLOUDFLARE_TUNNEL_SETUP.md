# Cloudflare Tunnel Setup for Local Development

Complete workflow for setting up a custom domain with Cloudflare Tunnel for local Shopify app development.

## Prerequisites

- Cloudflare account with your domain (e.g., `traffishow.com`)
- Domain configured in Cloudflare with Cloudflare as DNS provider
- `cloudflared` installed locally: `brew install cloudflared` (Mac) or see [Cloudflare docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

## Step 1: Create Cloudflare Tunnel

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to: **Zero Trust** → **Networks** → **Connectors**
3. Click **"+ Create a tunnel"** or **"Manage Tunnels"** → **"Add a Tunnel"**
4. Select **"Create new cloudflared Tunnel"**
5. **Name your tunnel** (e.g., `myapp-tunnel`)
6. Click **"Save tunnel"**

## Step 2: Install and Run Connector

1. On the **"Install and run connector"** page:
   - Select your OS (Mac/Linux/Windows)
   - Copy the **"OR run the tunnel manually"** command:
     ```bash
     cloudflared tunnel run --token eyJhIjoi...
     ```

2. **Run the tunnel in Terminal 1** (keep it running):
   ```bash
   cloudflared tunnel run --token <your-token>
   ```

3. Verify tunnel is **"HEALTHY"** in Cloudflare dashboard

## Step 3: Configure Public Hostname (Subdomain)

1. In Cloudflare dashboard, go to your tunnel → **"Public Hostnames"** tab
2. Click **"Add a public hostname"** or proceed to **"Route tunnel"** step
3. Configure:
   - **Subdomain:** `myapp-dev` (or your choice)
   - **Domain:** `traffishow.com` (your domain)
   - **Path:** `/` (optional)
   - **Service Type:** `HTTP`
   - **Service URL:** `localhost:3000` (or your app's port)
4. Click **"Complete setup"** or **"Save"**

**Result:** Your subdomain `myapp-dev.traffishow.com` now points to `localhost:3000`

## Step 4: Configure Your App

### 4.1 Update `shopify.app.toml`

```toml
application_url = "https://myapp-dev.traffishow.com"

[auth]
redirect_urls = [
  "https://myapp-dev.traffishow.com/api/auth"
]
```

### 4.2 Update `vite.config.ts`

Add your custom domain to `allowedHosts`:

```typescript
export default defineConfig({
  server: {
    allowedHosts: [host, "myapp-dev.traffishow.com", "localhost"],
    // ... rest of config
  },
});
```

**Fix HMR WebSocket** (always use localhost for local dev):

```typescript
// Always use localhost for HMR when running dev server locally
// The custom domain is only for external access via Cloudflare Tunnel
let hmrConfig = {
  protocol: "ws",
  host: "localhost",
  port: 64999,
  clientPort: 64999,
};
```

### 4.3 Add `dev:local` Script to `package.json`

```json
{
  "scripts": {
    "dev:local": "SHOPIFY_APP_URL=https://myapp-dev.traffishow.com react-router dev"
  }
}
```

### 4.4 Set Environment Variables

Create `.env` file in your app root:

```bash
SHOPIFY_APP_URL=https://myapp-dev.traffishow.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products
```

**Or** pull from Shopify CLI:
```bash
shopify app env pull
```

## Step 5: Run Your App

**Terminal 1** (Cloudflare Tunnel - keep running):
```bash
cloudflared tunnel run --token <your-token>
```

**Terminal 2** (Your app):
```bash
cd your-app
npm run dev:local
```

## Step 6: Update Shopify Partners Dashboard

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Select your app → **App setup**
3. Update **App URL:** `https://myapp-dev.traffishow.com`
4. Update **Allowed redirection URL(s):** `https://myapp-dev.traffishow.com/api/auth`
5. Save

## Step 7: Test

1. Visit: `https://myapp-dev.traffishow.com`
2. Should show your app (not 404)
3. Install app in your dev store
4. Access via Shopify Admin

## Troubleshooting

### Tunnel shows "DOWN" status
- Make sure `cloudflared tunnel run` is still running in Terminal 1
- Check if token is valid (regenerate if needed)

### "Blocked request" error
- Add your subdomain to `allowedHosts` in `vite.config.ts`
- Restart dev server

### "appUrl configuration" error
- Set `SHOPIFY_APP_URL` in `.env` or in `dev:local` script
- Make sure `.env` file is loaded

### WebSocket errors
- Already fixed by using localhost for HMR (see Step 4.2)
- These are non-critical (only affect hot reload)

### 404 errors
- Verify tunnel is "HEALTHY" in Cloudflare dashboard
- Check Service URL matches your app's port (e.g., `localhost:3000`)
- Ensure both tunnel and app are running

## Quick Reference

**Files to update:**
- `shopify.app.toml` - App URL and redirect URLs
- `vite.config.ts` - Allowed hosts and HMR config
- `package.json` - Add `dev:local` script
- `.env` - Environment variables

**Commands:**
```bash
# Terminal 1: Run tunnel
cloudflared tunnel run --token <token>

# Terminal 2: Run app
npm run dev:local
```

**URLs:**
- Custom domain: `https://myapp-dev.traffishow.com`
- Local server: `http://localhost:3000`

## Notes

- The tunnel must stay running while developing
- Custom domain only works when tunnel is active
- HMR uses localhost (not custom domain) for WebSocket
- Each project needs its own tunnel or separate public hostname






