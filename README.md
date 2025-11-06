# Rollbar Next.js Starter Kit

**Ship faster with confidence** — A complete starter kit for integrating Rollbar error monitoring into your Next.js App Router application. Kickstart your error monitoring in minutes and ship with no worries.

**🌐 Public Demo**: This app can be deployed as a public demo where users can configure their own Rollbar tokens via the UI (stored in localStorage). Perfect for live demos, workshops, or self-service trials!

## What This Demonstrates

This demo app shows how to:
- Integrate Rollbar's browser SDK with Next.js App Router
- Send different types of events (info, warning, error, exception) to Rollbar
- Track sent events with item UUIDs, status, and timestamps
- Display event history in an interactive slideout panel
- Use client-side only event tracking (in-memory storage)
- Allow users to configure their own Rollbar tokens (for public demos)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Rollbar account with a client access token (post_client_item scope)

## Local Setup

### 1. Install Dependencies

```bash
cd rollbar-vercel
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Rollbar client access token:

```env
NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN=your_rollbar_client_token_here
NEXT_PUBLIC_ROLLBAR_ENV=development
```

To get your Rollbar client token:
1. Log in to [Rollbar](https://rollbar.com)
2. Navigate to Settings → Project Access Tokens
3. Find or create a token with `post_client_item` scope
4. Copy the token value

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

### Quick Deploy

1. Push this project to a Git repository (GitHub, GitLab, or Bitbucket)
2. Visit [Vercel](https://vercel.com) and create a new project
3. Import your repository
4. Configure environment variables in Project Settings:
   - `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` - Your Rollbar client access token
   - `NEXT_PUBLIC_ROLLBAR_ENV` - Set to `production` or your preferred environment name
5. Deploy

### Alternative: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and set environment variables when asked.

## Source Maps for Better Stack Traces

By default, production builds in Next.js are minified and bundled, which results in unhelpful stack traces in Rollbar (showing webpack-internal paths). To get **readable stack traces with actual file names and line numbers**, you need to upload source maps to Rollbar.

### Setup

This project is already configured with:
- `next.config.js` - Enables production source maps
- `scripts/upload-sourcemaps.js` - Uploads source maps to Rollbar after build

### Local Production Build with Source Maps

1. Get your **server-side** Rollbar token (different from client token):
   - Go to [Rollbar Settings → Access Tokens](https://rollbar.com/settings/account/access-tokens/)
   - Find or create a token with `post_server_item` scope
   - Copy the token value

2. Add to `.env.local`:
```env
ROLLBAR_SERVER_TOKEN=your_server_token_here
BASE_URL=http://localhost:3000
```

3. Build and upload source maps:
```bash
npm run build:production
```

This will:
- Build your Next.js app with source maps enabled
- Upload all `.map` files to Rollbar
- Map minified code back to your original source files

### Vercel Deployment with Source Maps

Add these environment variables in Vercel Project Settings:

1. `ROLLBAR_SERVER_TOKEN` - Your server access token
2. `BASE_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
3. `SOURCE_VERSION` - (Optional) Version tag for tracking (e.g., `1.0.0` or git commit SHA)

Update your Vercel build command to:
```bash
npm run build:production
```

### Verifying Source Maps Work

1. Send an exception from your deployed app
2. Open the error in Rollbar
3. Check the stack trace - you should now see:
   - ✅ Actual file paths like `components/EventControls.js:57`
   - ✅ Real function names
   - ✅ Correct line numbers
   - ❌ NOT webpack-internal paths

### Important Notes

- Source maps are **only uploaded during production builds** using `npm run build:production`
- Development builds (`npm run dev`) don't need source maps - they already have readable stack traces
- Source maps are **not included** in your deployed bundle (they're uploaded to Rollbar separately)
- Without `ROLLBAR_SERVER_TOKEN`, the build will still succeed but skip source map uploads

## Using as a Public Demo

This app is designed to work as a **public demo** where users can configure their own Rollbar tokens without requiring environment variables or deployment configuration.

### For Demo Visitors

1. Visit the deployed demo app
2. Click the **Settings** button in the header
3. Enter your Rollbar Client Access Token:
   - Go to [Rollbar Settings → Access Tokens](https://rollbar.com/settings/account/access-tokens/)
   - Copy a token with `post_client_item` scope
   - Paste it in the settings modal
4. Click "Save Token"
5. Start sending events!

The token is stored in your browser's localStorage and will persist across page reloads. It's never sent to any server other than Rollbar's API.

### For Demo Hosts

You can deploy this to Vercel (or any hosting platform) **without configuring any environment variables**. The entire demo is self-service - each visitor configures their own token.

**Optional**: You can still set `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` in your deployment environment as a default/fallback token for quick testing.

## How to Use the Demo

### Sending Events

The demo provides four types of events you can send to Rollbar:

1. **Send Log (Info)** - Sends an informational log message
2. **Send Warning** - Sends a warning-level message
3. **Send Error** - Sends an error-level message
4. **Send Exception** - Creates and sends a JavaScript Error object

### Viewing Event History

1. Click any of the event buttons to send an event to Rollbar
2. Watch the counter at the top increment with each sent event
3. Click the "View History" button to open the event slideout
4. The slideout displays:
   - Event level/type with color-coded badges
   - Rollbar item UUID (unique identifier for each event)
   - Status (sent, queued, or error)
   - Timestamp of when the event was sent

### Verifying in Rollbar

After sending events:
1. Log in to your Rollbar dashboard
2. Navigate to Items → All Items
3. You should see the events appear in real-time
4. Click on any item to see full details

## Important Notes

### In-Memory Storage

Event history is stored **only in browser memory**. This means:
- Refreshing the page clears all event history
- The counter resets to zero on reload
- No data persists between sessions
- This is intentional for demo simplicity

### Client-Side Only

This demo uses only Rollbar's browser SDK with a client access token. For production applications, consider:
- Using server-side tokens for sensitive operations
- Implementing proper error boundaries
- Adding server-side error tracking
- Storing event history in a database if needed

## Project Structure

```
rollbar-vercel/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.js            # Root layout component
│   └── page.js              # Home page with demo controls
├── components/
│   ├── EventControls.js     # Main control panel with buttons
│   ├── EventSlideout.js     # Event history slideout
│   └── Header.js            # Simple header with logo
├── lib/
│   ├── rollbarClient.js     # Rollbar SDK initialization
│   └── time.js              # Timestamp and UUID utilities
├── public/
│   └── logo.svg             # Rollbar logo
├── .env.example             # Environment variable template
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint (if configured)

## Learn More

### Rollbar Documentation

- [Rollbar JavaScript SDK](https://docs.rollbar.com/docs/javascript)
- [Browser JavaScript Guide](https://docs.rollbar.com/docs/browser-js)
- [Client Access Tokens](https://docs.rollbar.com/docs/access-tokens#post_client_item)
- [Item Levels](https://docs.rollbar.com/docs/items#item-levels)

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Learn Next.js](https://nextjs.org/learn)

## Troubleshooting

### Events Not Appearing in Rollbar

- Verify your `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` is correct
- Check browser console for errors
- Ensure the token has `post_client_item` scope
- Check network tab for failed requests to Rollbar API

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and `node_modules`, then reinstall
- Verify Node.js version is 18.x or higher

### Vercel Deployment Issues

- Double-check environment variables are set in Vercel dashboard
- Ensure variables start with `NEXT_PUBLIC_` prefix
- Check Vercel build logs for specific errors

## License

This is a demo project for educational purposes. Feel free to use and modify as needed.

## Support

For issues with:
- **This demo**: Open an issue in the project repository
- **Rollbar SDK**: Visit [Rollbar Support](https://rollbar.com/docs/)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
