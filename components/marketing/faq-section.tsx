import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { FAQS } from "./content/faq"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-background py-24 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
        <SectionHeading
          eyebrow="Questions"
          title="The things owners ask first."
        />

        <Reveal delay={80}>
          <Accordion type="single" collapsible className="gap-0">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-b">
                <AccordionTrigger className="py-5 text-[0.9375rem] font-medium hover:no-underline sm:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
