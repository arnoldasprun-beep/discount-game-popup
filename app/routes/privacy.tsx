import type { HeadersFunction, MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Discount Game" },
    { name: "description", content: "Privacy Policy for Discount Game app" },
  ];
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "public, max-age=3600",
  };
};

export default function Privacy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6" }}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated: {new Date().toLocaleDateString()}</strong></p>

      <section style={{ marginTop: "2rem" }}>
        <h2>1. Introduction</h2>
        <p>
          Discount Game ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect information when you use our Shopify app (the "Service").
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Shop Information</h3>
        <p>We collect the following information related to your Shopify store:</p>
        <ul>
          <li>Shop domain name (e.g., yourstore.myshopify.com)</li>
          <li>App settings and customization preferences (game selection, colors, text, discount settings, etc.)</li>
          <li>Theme and app embed status</li>
        </ul>

        <h3>2.2 Customer Data</h3>
        <p>When customers play the discount game and claim discount codes, we collect:</p>
        <ul>
          <li><strong>Email Address:</strong> Required to generate and deliver discount codes</li>
          <li><strong>Name (Optional):</strong> First and last name if provided by the customer</li>
          <li><strong>Discount Code:</strong> The discount code generated for the customer</li>
          <li><strong>Discount Percentage:</strong> The discount percentage won in the game</li>
          <li><strong>Game Type:</strong> Which game was played (e.g., Spike Dodge, Pass the Gaps, Reaction Click)</li>
          <li><strong>Difficulty Level:</strong> The difficulty level at which the game was played</li>
          <li><strong>Device Type:</strong> Whether the game was played on mobile or desktop</li>
          <li><strong>Timestamp:</strong> When the discount was claimed</li>
        </ul>

        <h3>2.3 Game Analytics Data</h3>
        <p>To provide analytics and improve the service, we collect:</p>
        <ul>
          <li><strong>Popup Views:</strong> When the game popup is displayed to visitors</li>
          <li><strong>Game Plays:</strong> When visitors start playing a game</li>
          <li><strong>Session Identifiers:</strong> Anonymous session IDs to track game activity</li>
          <li><strong>Device Information:</strong> Mobile or desktop device type</li>
        </ul>
        <p>
          <strong>Important:</strong> Game analytics data is anonymized and used solely for providing analytics to store owners and improving the app functionality.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>3. How We Use Your Information</h2>
        
        <h3>3.1 Shop Information</h3>
        <p>We use your shop information to:</p>
        <ul>
          <li>Store and retrieve your app settings and customization preferences</li>
          <li>Generate discount codes through Shopify's API</li>
          <li>Associate game data and discount claims with your store</li>
          <li>Ensure proper functionality of the app</li>
          <li>Respond to support requests</li>
        </ul>

        <h3>3.2 Customer Data</h3>
        <p>We use customer data exclusively for:</p>
        <ul>
          <li><strong>Discount Code Generation:</strong> Creating unique discount codes through Shopify's API</li>
          <li><strong>Preventing Duplicate Claims:</strong> Ensuring each email can only claim one discount code</li>
          <li><strong>Analytics:</strong> Providing you with analytics about discount claims, game plays, and conversion rates</li>
          <li><strong>Customer Support:</strong> Assisting with discount code issues if needed</li>
        </ul>
        <p>
          Customer data is <strong>not</strong> used for:
        </p>
        <ul>
          <li>Advertising or marketing purposes</li>
          <li>Sharing with third parties</li>
          <li>Any purpose beyond discount code generation and analytics</li>
        </ul>

        <h3>3.3 Game Analytics Data</h3>
        <p>We use game analytics data for:</p>
        <ul>
          <li><strong>Analytics Dashboard:</strong> Providing you with insights about popup views, game plays, and conversion rates</li>
          <li><strong>Service Improvement:</strong> Understanding how the app is used to improve functionality</li>
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>4. Data Storage and Security</h2>
        <p>
          Your data is stored securely using:
        </p>
        <ul>
          <li><strong>Database:</strong> MySQL database hosted on secure cloud infrastructure</li>
          <li><strong>Hosting:</strong> Cloud infrastructure with industry-standard security</li>
          <li><strong>Security:</strong> Industry-standard encryption and security measures</li>
          <li><strong>Shopify Integration:</strong> Discount codes are created through Shopify's secure API</li>
        </ul>
        <p>
          We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>5. Data Retention</h2>
        
        <h3>5.1 Shop Settings</h3>
        <p>
          We retain your shop settings (customization preferences, configuration options) for as long as your app is installed. When you uninstall the app, all shop settings are deleted.
        </p>

        <h3>5.2 Customer Data</h3>
        <p>
          We retain customer discount claim data (emails, discount codes, game analytics) for as long as your app is installed to provide analytics functionality. When you uninstall the app, all customer data and analytics are permanently deleted.
        </p>
        <p>
          <strong>Request Deletion:</strong> You may request deletion of all your data (including customer data) by uninstalling the app or contacting us directly. Individual customers may also request deletion of their data through Shopify's compliance webhooks.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>6. Data Sharing</h2>
        <p>
          <strong>We do NOT share your data with third parties.</strong> Specifically:
        </p>
        <ul>
          <li>We do NOT sell, trade, or rent your information</li>
          <li>We do NOT share customer data with third parties</li>
          <li>We do NOT use analytics services or tracking pixels</li>
          <li>We do NOT share data with advertisers or marketing companies</li>
        </ul>
        <p>
          <strong>Limited Exceptions:</strong> We may share data only in the following circumstances:
        </p>
        <ul>
          <li>To comply with legal obligations or court orders</li>
          <li>To protect our rights, property, or safety, or that of our users</li>
          <li>With service providers who assist in operating our Service (e.g., database hosting), subject to strict confidentiality agreements and data protection requirements</li>
        </ul>
        <p>
          <strong>Shopify Integration:</strong> Your shop data and customer discount codes are shared with Shopify as necessary for the app to function. Discount codes are created through Shopify's API and are subject to Shopify's privacy policy. Please review <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer">Shopify's Privacy Policy</a> for how they handle your data.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>7. Your Rights (GDPR, CCPA, and Other Privacy Laws)</h2>
        
        <h3>7.1 Rights Under GDPR</h3>
        <ul>
          <li>Access, rectification, erasure, restriction, portability, objection, and withdrawal of consent.</li>
        </ul>

        <h3>7.2 Rights Under CCPA</h3>
        <ul>
          <li>Right to know, delete, opt-out (not applicable since we do not sell data), and non-discrimination.</li>
        </ul>

        <h3>7.3 How to Exercise Rights</h3>
        <p>
          Contact us through the Shopify Partner Dashboard or via email. You may also delete all data immediately by uninstalling the app. Upon uninstallation, all shop settings, customer data, and analytics will be deleted.
        </p>
        <p>
          <strong>Customer Data Requests:</strong> Customers can request access to or deletion of their data through Shopify's compliance webhooks, which we handle automatically.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>8. Third-Party Services</h2>
        
        <h3>8.1 Shopify</h3>
        <p>
          Our Service integrates with Shopify to provide the app functionality and generate discount codes. Shopify has its own privacy policy. We recommend reviewing <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer">Shopify's Privacy Policy</a> to understand how they handle your data.
        </p>

        <h3>8.2 Infrastructure Providers</h3>
        <p>
          We use the following service providers to host and operate our Service:
        </p>
        <ul>
          <li><strong>Cloud Hosting:</strong> Cloud infrastructure for hosting the app and database</li>
        </ul>
        <p>
          These providers are contractually obligated to protect your data and comply with applicable privacy laws. They do not have independent rights to use or share your data.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>9. Children's Privacy</h2>
        <p>
          Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>10. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us through the Shopify Partner Dashboard or via email.
        </p>
      </section>
    </div>
  );
}
