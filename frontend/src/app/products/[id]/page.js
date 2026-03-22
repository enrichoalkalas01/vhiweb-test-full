// Server component — exports generateStaticParams (required for static export)
// All UI logic lives in ProductDetailClient (client component).
import ProductDetailClient from './ProductDetailClient'

// Generates a single shell HTML file at build time.
// Express serves it for every /products/:id request;
// the client-side useParams() reads the real ID and fetches the product.
export function generateStaticParams() {
    return [{ id: '__id__' }]
}

export default function ProductDetailPage() {
    return <ProductDetailClient />
}
