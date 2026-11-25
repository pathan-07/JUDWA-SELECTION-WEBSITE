import Link from 'next/link';
import Image from 'next/image';
import {
  CategoryCardSettings,
  categoryContainerClasses,
  categoryImageClasses,
  categoryItemClasses,
  categoryLabelClasses,
  effectiveCategorySettings,
} from '@/lib/categoryCardSettings';

export interface CategoryCardItem {
  label: string;
  href: string;
  image: string;
}

export default function CategoryCards({ items, settings }: { items: CategoryCardItem[]; settings: CategoryCardSettings }) {
  const s = effectiveCategorySettings(settings);
  return (
    <div className={categoryContainerClasses(s)}>
      {items.map(cat => (
        <Link key={cat.href} href={cat.href} className={categoryItemClasses(s)}>
          <div className={`relative ${categoryImageClasses(s)} bg-ink-50 overflow-hidden`}>
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 15vw"
              loading="lazy"
              unoptimized={cat.image.startsWith('data:')}
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            {s.label === 'overlay' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-2 sm:p-3 text-center font-serif text-sm sm:text-base font-semibold text-white truncate">
                  {cat.label}
                </span>
              </>
            )}
          </div>
          {s.label === 'below' && (
            <span
              className={`block text-center font-serif font-semibold text-ink-900 group-hover:text-gold-600 truncate ${categoryLabelClasses(s)}`}
            >
              {cat.label}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
