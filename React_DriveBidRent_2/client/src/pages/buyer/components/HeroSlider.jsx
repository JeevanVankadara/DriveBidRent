// client/src/pages/buyer/components/HeroSlider.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import heroDesert from '../../../assets/hero-desert.jpg';
import heroCoast from '../../../assets/hero-coast.jpg';
import heroCity from '../../../assets/hero-city.jpg';

const slides = [
  {
    image: heroDesert,
    eyebrow: 'Welcome',
    title: 'Elevate Your Journey',
    body: 'The premier destination for luxury automotive trading and uncompromising experiences.',
  },
  {
    image: heroCoast,
    eyebrow: 'Live Auctions',
    title: 'Bid With Confidence',
    body: 'Every listing is inspected, history-checked and priced by the market — not by guesswork.',
  },
  {
    image: heroCity,
    eyebrow: 'Elite Rentals',
    title: 'Drive It Today',
    body: 'Book a premium ride by the day with transparent pricing and instant confirmation.',
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[active];

  return (
    <section className="hub-hero-wrap">
      <div className="hub-hero">
        <img
          src={slide.image}
          alt={slide.title}
          width={1920}
          height={1080}
          className="hub-hero-img"
        />
        <div className="hub-hero-scrim" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-2xl px-8 lg:px-20">
            <p className="hub-eyebrow hub-text-primary flex items-center gap-4">
              <span className="hub-bg-primary-line h-px w-10" />
              {slide.eyebrow}
            </p>
            <h1 className="hub-display hub-text-midnight-fg mt-5 text-5xl lg:text-7xl" style={{ lineHeight: 1.02 }}>
              {slide.title}
            </h1>
            <p className="hub-text-midnight-fg-80 mt-6 max-w-lg text-lg">{slide.body}</p>
            <Link to="/buyer/auctions" className="hub-cta mt-9">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
          className="hub-hero-arrow left-5"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setActive((i) => (i + 1) % slides.length)}
          className="hub-hero-arrow right-5"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={'Go to slide ' + (i + 1)}
              onClick={() => setActive(i)}
              className={`hub-hero-dot ${i === active ? 'is-active' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
