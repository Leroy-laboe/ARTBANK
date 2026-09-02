import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { cva } from 'class-variance-authority';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

// Scoped to this component rather than a shared `@/components/ui/button` —
// this project already has its own CSS-Modules `Button` (src/components/ui/Button.tsx)
// used everywhere else; a second, differently-styled shadcn Button of the same
// name would collide (Windows' filesystem is case-insensitive: button.tsx and
// Button.tsx are the same file) and confuse which one a page should use.
const pricingButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground'
);

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  /** Off when there's only one real price on offer — avoids a toggle that
   *  flips between a real, approved number and a fabricated second one. */
  showBillingToggle?: boolean;
}

export function Pricing({
  plans,
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.',
  showBillingToggle = true,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl px-6 py-14 bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(185,136,79,0.10),transparent_65%)]">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-muted-foreground text-base whitespace-pre-line">{description}</p>
      </div>

      {showBillingToggle && (
        <div className="flex justify-center items-center mb-8">
          <label className="relative inline-flex items-center cursor-pointer">
            <Label>
              <Switch ref={switchRef} checked={!isMonthly} onCheckedChange={handleToggle} className="relative" />
            </Label>
          </label>
          <span className="ml-2 font-semibold">
            Annual billing <span className="text-primary">(Save 20%)</span>
          </span>
        </div>
      )}

      <div
        className={cn(
          'grid grid-cols-1 gap-4 mx-auto',
          plans.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-2 lg:grid-cols-3'
        )}
      >{/* Sized for however many real plans are passed in — 2 today, room for a 3rd tier later. */}
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    scale: 1,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: 'spring',
              stiffness: 100,
              damping: 30,
              delay: 0.2 * index,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              'rounded-2xl border-[1px] p-6 bg-card text-center lg:flex lg:flex-col lg:justify-center relative',
              'shadow-[0_2px_10px_-2px_rgba(21,17,12,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-8px_rgba(21,17,12,0.16)]',
              plan.isPopular
                ? 'border-primary border-2 shadow-[0_10px_36px_-6px_rgba(185,136,79,0.28)]'
                : 'border-border',
              'flex flex-col',
              !plan.isPopular && 'mt-5'
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary py-0.5 px-2.5 rounded-bl-xl rounded-tr-[calc(1rem-1px)] flex items-center gap-1">
                <Star className="text-primary-foreground h-3 w-3 fill-current" />
                <span className="text-primary-foreground text-[10px] font-sans font-semibold tracking-wide uppercase">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                {plan.name}
              </p>
              <div className="mt-4 flex items-center justify-center gap-x-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  <NumberFlow
                    value={showBillingToggle && !isMonthly ? Number(plan.yearlyPrice) : Number(plan.price)}
                    locales="en-US"
                    format={{
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{ duration: 500, easing: 'ease-out' }}
                    willChange
                  />
                </span>
                {plan.period !== 'forever' && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                    / {plan.period}
                  </span>
                )}
              </div>

              {showBillingToggle && (
                <p className="text-xs leading-5 text-muted-foreground">
                  {isMonthly ? 'billed monthly' : 'billed annually'}
                </p>
              )}

              <ul className="mt-4 gap-1.5 flex flex-col flex-1 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-3 border-border" />

              <Link
                to={plan.href}
                className={cn(
                  pricingButtonVariants(),
                  'group relative w-full gap-2 overflow-hidden text-base font-semibold tracking-tighter h-10 px-6',
                  'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-primary-foreground',
                  plan.isPopular ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">{plan.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
