import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Redirect to /app if shop parameter exists OR if embedded app parameters exist
  if (url.searchParams.get("shop") || 
      url.searchParams.get("embedded") || 
      url.searchParams.get("hmac")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Discount Game - Interactive Discount Games for Your Store</h1>
        <p className={styles.text}>
          Engage customers with fun interactive games and reward them with discount codes. Increase conversions and email capture with customizable game popups.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Multiple Game Options</strong>. Choose from interactive games like Spike Dodge, Bouncing Ball, and Reaction Click to engage your customers.
          </li>
          <li>
            <strong>Automatic Discount Codes</strong>. Generate unique discount codes based on game performance, automatically delivered to customers via email.
          </li>
          <li>
            <strong>Full Customization</strong>. Customize game colors, text, popup timing, display settings, and more to match your brand.
          </li>
          <li>
            <strong>Analytics Dashboard</strong>. Track game plays, popup views, conversions, and discount claims to measure your success.
          </li>
        </ul>
      </div>
    </div>
  );
}
