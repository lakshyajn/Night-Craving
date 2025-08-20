import { CartProvider } from '../app/contexts/CartContext';
import { LocationProvider } from '../app/contexts/LocationContext';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <LocationProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </LocationProvider>
  );
}

export default MyApp;