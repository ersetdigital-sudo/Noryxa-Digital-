import Link from "next/link";
import type { Product } from "@/lib/data";
import { rupiah } from "@/lib/data";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, category, price, img, tags } = product;
  const hasPromo = tags.includes("promo");
  const hasInstant = tags.includes("instant");

  return (
    <Link href="/product" className="card p-2.5 block group">
      <div className="tile-art">
        <img src={img} alt={name} loading="lazy" />
        {hasPromo && (
          <em className="absolute top-2 left-2 not-italic text-[10px] font-bold bg-[#ff385c] text-white rounded-full px-2 py-[3px] shadow-[0_4px_12px_rgba(255,56,92,.4)]">
            PROMO
          </em>
        )}
        {hasInstant && (
          <em className="absolute bottom-2 left-2 not-italic text-[10px] font-semibold bg-black/65 text-white backdrop-blur rounded-full px-2 py-[3px]">
            Instan
          </em>
        )}
      </div>
      <p className="clamp2 text-[13px] font-semibold mt-2.5 leading-snug group-hover:text-[#ff385c] transition">
        {name}
      </p>
      <p className="text-[11px] text-[#717171] mt-0.5">{category}</p>
      <p className="text-[13px] font-bold text-[#ff385c] mt-1">
        Mulai {rupiah(price)}
      </p>
    </Link>
  );
}
