import { redirect } from 'next/navigation';

/**
 * The root page of the application simply redirects to the `/review` route.
 * This ensures that visiting the base URL immediately starts a review session.
 */
export default function Home() {
  redirect('/review');
}