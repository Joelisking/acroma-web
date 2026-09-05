import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Reveal } from "./reveal"

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="surface-grain relative overflow-hidden bg-brand-orange py-24 sm:py-28">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 text-center lg:px-8">
        <Reveal>
          <h2 className="mk-title text-balance text-white">
            Your customers are already messaging. Let them buy.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/85">
            Connect the number you already use, add your catalog, and let Acroma
            pick up the next message.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="xl"
              className="w-full bg-white text-brand-orange hover:bg-white/90 sm:w-auto"
            >
              <Link href={signedIn ? "/dashboard" : "/register"}>
                {signedIn ? "Go to dashboard" : "Get started"}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            {!signedIn && (
              <Button
                asChild
                size="xl"
                variant="ghost"
                className="w-full border border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
