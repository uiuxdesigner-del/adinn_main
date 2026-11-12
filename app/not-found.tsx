import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="py-10 md:py-16">
      <h1 className="text-h1">Page not found</h1>
      <p className="prose-width mt-4 text-ash">
        The page you are looking for does not exist or may have moved. Go back
        to the home page, or contact us and we’ll help you find what you need.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/">Go to Home</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contact Us
        </ButtonLink>
      </div>
    </Container>
  );
}
