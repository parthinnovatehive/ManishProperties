import type { Testimonial } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Stars } from "@/components/ui/stars";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="bg-white py-24 lg:py-28">
      <div className="container-wide">
        <div className="mb-14 text-center">
          <div className="section-eyebrow mb-3 bg-estate-amber-pale text-estate-amber-dark">Testimonials</div>
          <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-estate-navy">Trusted by Thousands</h2>
          <p className="mt-2.5 text-[15px] text-estate-text-sec">Real stories from homebuyers, sellers, and investors across India</p>
        </div>

        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-estate-border bg-estate-bg p-8 text-center text-sm font-semibold text-estate-text-sec">
            No testimonials are available from the API yet.
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-8">
              <Stars rating={testimonial.rating} />
              <p className="mb-5 mt-4 text-[15px] italic leading-7 text-estate-text-sec">&quot;{testimonial.text}&quot;</p>
              <div className="flex items-center gap-3 border-t border-estate-border pt-4">
                <Avatar initials={testimonial.avatar} />
                <div>
                  <div className="text-sm font-bold text-estate-text">{testimonial.name}</div>
                  <div className="text-[13px] text-estate-muted">
                    {testimonial.role} · {testimonial.city}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
