export default function SectionTitle({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-8 sm:mb-10`}>
      {eyebrow && (
        <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.22em] text-[#AA5E7A]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#381E29]">{title}</h2>
      {description && <p className="mt-2 text-sm sm:text-base text-[#6E4154] max-w-2xl">{description}</p>}
    </div>
  );
}
