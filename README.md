# Discount Game - Shopify App

A Shopify app that engages customers with interactive games and rewards them with discount codes. Increase conversions and email capture with customizable game popups.

## Features

- **Multiple Game Options**: Choose from interactive games like Spike Dodge (Horizontal Lines), Bouncing Ball, and Reaction Click
- **Automatic Discount Codes**: Generate unique discount codes based on game performance
- **Full Customization**: Customize game colors, text, popup timing, display settings, and more to match your brand
- **Analytics Dashboard**: Track game plays, popup views, conversions, and discount claims to measure your success
- **Theme Integration**: Seamlessly integrate with your Shopify theme using app blocks and app embeds
- **Mobile & Desktop Support**: Configure separate settings for mobile and desktop experiences

## Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already (Node.js 20.19+ or 22.12+)
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app
4. **Shopify CLI**: [Download and install](https://shopify.dev/docs/apps/tools/cli/getting-started) it if you haven't already
5. **MySQL Database**: A MySQL database (e.g., from Railway, PlanetScale, or other providers) for production

## Setup

1. Clone this repository
2. Install dependencies:
   ```shell
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=write_products,write_discounts,read_themes
   SHOPIFY_APP_URL=https://your-app-url.com
   ```

4. Set up the database:
   ```shell
   npx prisma generate
   npx prisma db push
   ```

## Local Development

Run the development server:

```shell
npm run dev
```

Or using Shopify CLI:

```shell
shopify app dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

## Application Storage

This app uses [Prisma](https://www.prisma.io/) with a MySQL database to store:
- Session data (Shopify authentication)
- Shop settings and game configurations
- Customer discount claims
- Analytics data (popup views, game plays)

The database is defined as a Prisma schema in `prisma/schema.prisma`.

### Database Setup

The app is configured to use MySQL. Make sure your `DATABASE_URL` environment variable is set correctly in your `.env` file for local development and in your hosting environment for production.

To initialize the database:
```shell
npx prisma generate
npx prisma db push
```

## Build

Build the app by running:

```shell
npm run build
```

## Deployment

When you're ready to set up your app in production, you can follow [Shopify's deployment documentation](https://shopify.dev/docs/apps/launch/deployment) to host it externally.

### Environment Variables

Make sure to set the following environment variables in your hosting environment:
- `DATABASE_URL` - Your MySQL database connection string
- `SHOPIFY_API_KEY` - Your Shopify app API key
- `SHOPIFY_API_SECRET` - Your Shopify app API secret
- `SCOPES` - Required scopes (write_products,write_discounts,read_themes)
- `SHOPIFY_APP_URL` - Your app's production URL
- `NODE_ENV=production`

### Database Migration

After deploying, run database migrations:
```shell
npm run setup
```

This runs `prisma generate && prisma migrate deploy`.

## Privacy & Compliance

This app collects and processes customer data (emails, names, discount codes) for the purpose of generating discount codes and providing analytics. The app implements GDPR compliance webhooks for data requests and deletions.

- **Privacy Policy**: Available at `/privacy`
- **Terms of Service**: Available at `/terms`

## Resources

- [Shopify App Documentation](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [React Router docs](https://reactrouter.com/home)
- [Prisma Documentation](https://www.prisma.io/docs)

## Troubleshooting

### Database tables don't exist

If you get an error like:
```
The table `Session` does not exist in the current database.
```

Create the database tables by running:
```shell
npx prisma db push
```

### Database connection issues

Make sure your `DATABASE_URL` environment variable is correctly set and that your MySQL database is accessible from your hosting environment.

### Webhooks not working

Ensure webhooks are properly registered in `shopify.app.toml` and that your app URL is correctly configured.

## License

[Add your license information here]
