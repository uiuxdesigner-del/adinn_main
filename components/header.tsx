"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui";
import { ENQUIRY_HREF, mainNav, utilityNav } from "@/lib/navigation";

const headerNav = [{ href: "/", label: "Home" }, ...mainNav];

export function Header() {
  const pathname = usePathname();
  // The menu is "open" only for the page it was opened on, so navigating closes it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [open]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const navLink = (
    item: { href: string; label: string },
    className: string,
  ) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={`rounded-md text-[0.9375rem] font-medium text-ash transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:bg-line ${className}`}
    >
      {item.label}
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-white"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpenFor(null);
          buttonRef.current?.focus();
        }
      }}
    >
      <Container className="flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" className="shrink-0 rounded-md" aria-label="ADINN Advertising Services Ltd., home">
          <Image
            src="/Adinn.png"
            alt=""
            width={516}
            height={201}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {headerNav.map((item) => navLink(item, "px-4 py-2.5"))}
          <Link href={ENQUIRY_HREF} className="btn btn-primary ml-4">
            Discuss Your Requirement
          </Link>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="btn btn-secondary lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenFor(open ? null : pathname)}
        >
          {open ? "Close menu" : "Menu"}
        </button>
      </Container>

      <div
        id="mobile-menu"
        ref={panelRef}
        className={open ? "menu-panel border-t border-line lg:hidden" : "hidden"}
      >
        <Container className="py-4">
          <nav aria-label="Main (mobile)" className="flex flex-col gap-1">
            {headerNav.map((item) => navLink(item, "block px-3 py-3"))}
          </nav>
          <div className="mt-4">
            <Link href={ENQUIRY_HREF} className="btn btn-primary w-full">
              Discuss Your Requirement
            </Link>
          </div>
          <nav
            aria-label="Utility (mobile)"
            className="mt-4 flex flex-col gap-1 border-t border-line pt-3"
          >
            {utilityNav.map((item) => navLink(item, "block px-3 py-3"))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
