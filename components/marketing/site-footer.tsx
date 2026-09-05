import Link from "next/link"

import { Logo } from "@/components/brand/logo"

import { NAV_LINKS } from "./content/nav"

const COLUMNS = [
  { heading: "Product", links: NAV_LINKS },
  {
    heading: "Account",
    links: [
      { href: "/register", label: "Create an account" },
      { href: "/login", label: "Sign in" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="surface-grain bg-brand-navy py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" className="h-7" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              Order management and customer service for businesses that sell by
              chat, in Ghana and across West Africa.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="mk-mono text-white/40">{column.heading}</p>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mk-mono text-white/40">Company</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              <li>
                <a
                  href="https://asera.tech"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  asera.tech
                </a>
              </li>
              <li className="text-white/55">
                Investors and partners,{" "}
                <a
                  href="mailto:info@asera.tech"
                  className="text-brand-orange transition-colors hover:text-white"
                >
                  get in touch
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mk-rule mt-14" />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="mk-mono text-white/35">Acroma, a product of Asera</p>
          <p className="mk-mono text-white/35">Built in Accra</p>
        </div>
      </div>
    </footer>
  )
}
