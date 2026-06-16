import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { QuickAddToCart } from "@/components/public/quick-add-to-cart";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    shortDescription: string | null;
    basePriceCents: number;
    discountPriceCents: number | null;
    isRecommended: boolean;
    images: { url: string; alt: string | null }[];
    variants: {
      id: string;
      stockQuantity: number;
      priceOverrideCents?: number | null;
      discountOverrideCents?: number | null;
    }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.variants.some((variant) => variant.stockQuantity > 0);
  const firstAvailableVariant = product.variants.find((variant) => variant.stockQuantity > 0);
  const discountedVariant = product.variants.find((variant) => variant.discountOverrideCents);
  const discountPrice = product.discountPriceCents ?? discountedVariant?.discountOverrideCents ?? null;
  const basePrice = discountedVariant?.priceOverrideCents ?? product.basePriceCents;
  const hasDiscount = Boolean(discountPrice);
  return (
    <article className="group overflow-hidden rounded-lg border border-[#e2d7c8] bg-white shadow-sm">
      <Link href={`/catalog/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-[#efe7dc]">
          <Image
            src={product.images[0]?.url ?? "/placeholder-product.svg"}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {hasDiscount ? <Badge className="border-[#a7642c] bg-[#a7642c] text-white">Reducere</Badge> : null}
          {product.isRecommended ? <Badge>Recomandat</Badge> : null}
          {!inStock ? <Badge className="border-stone-300 bg-stone-100 text-stone-600">Stoc epuizat</Badge> : null}
        </div>
        <div>
          <Link href={`/catalog/${product.slug}`} className="font-medium text-[#2d2925] hover:text-[#a7642c]">
            {product.name}
          </Link>
          {product.shortDescription ? <p className="mt-1 line-clamp-2 text-sm text-[#74685c]">{product.shortDescription}</p> : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            {discountPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-[#8f5221]">{formatPrice(discountPrice)}</span>
                <span className="text-xs text-[#8d8174] line-through">{formatPrice(basePrice)}</span>
              </div>
            ) : (
              <span className="font-semibold">{formatPrice(product.basePriceCents)}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/catalog/${product.slug}`}>Detalii</Link>
            </Button>
            <QuickAddToCart variantId={firstAvailableVariant?.id} disabled={!inStock} />
          </div>
        </div>
      </div>
    </article>
  );
}
