import { Link } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import SectionTitle from '../components/section-title.jsx';

export default function About() {
  return (
    <section className="py-4 sm:py-8">
      <SectionTitle
        centered
        eyebrow="A little about us"
        title="Good things, chosen well"
        description="Fastbuy is here to make everyday shopping feel a little more considered."
      />

      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 mt-8">
        <div className="group overflow-hidden rounded-3xl bg-white/70 p-4 border border-[#D49A9A]/60 shadow-lg">
          <div className="overflow-hidden rounded-2xl aspect-[4/5] bg-[#F2DACE]/60">
            <img
              src={assets.decoration2}
              alt="A soft white flower arranged in a glass vase"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[#4A2033] font-medium">
          <p>
            The best everyday pieces aren’t complicated. They’re the ones that feel right, work hard, and fit into your life without asking for much.
          </p>
          <p>
            That’s the idea behind Fastbuy: a small, thoughtful edit of useful essentials for getting dressed, getting out the door, and everything in between.
          </p>
          <p>
            We’re building this collection one good find at a time. Thanks for being here at the beginning.
          </p>
          <div className="pt-2">
            <Link
              to="/collection"
              className="inline-block bg-[#7C0E44] text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:bg-[#630A36] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Get to know the collection →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 border-t border-[#D49A9A]/40 pt-12 sm:grid-cols-3">
        {[
          ['Thoughtful picks', 'Useful things with a little extra thought behind every single detail.'],
          ['Everyday value', 'Quality essentials that make sense for your everyday routine and budget.'],
          ['Always evolving', 'A growing collection inspired by modern lifestyles and timeless aesthetics.'],
        ].map(([title, description]) => (
          <div
            key={title}
            className="rounded-2xl bg-white/75 border border-[#D49A9A]/60 p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <h2 className="text-base font-bold text-[#381E29]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5E2F44] font-medium">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
