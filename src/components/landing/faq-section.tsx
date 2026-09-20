import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const faqs = [
  {
    question: "Is StackDuel free to use?",
    answer:
      "Yes. You can create a free account, solve problems, and compete in games without paying anything.",
  },
  {
    question: "What programming languages are supported?",
    answer:
      "We currently support 3 languages: Python, JavaScript, and SQLite. We plan to add many more languages in the future. If you have a language you'd like to see supported, please let us know.",
  },
  {
    question: "How are matches judged?",
    answer:
      "Submissions are judged instantly against a set of test cases. You solve as many problems as you can in the time limit, and the player with the most points wins.",
  },
  {
    question: "What game modes are available?",
    answer:
      "You can compete head-to-head, join a free-for-all lobby, or race solo against the clock.",
  },
  {
    question: "StackDuel is in alpha, what does that mean?",
    answer:
      "The platform is still under active development, so features may change and you may run into occasional bugs. Feedback is welcome.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FaqSection() {
  return (
    <section className="border-t py-16">
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Everything you need to know before jumping in.
          </p>
        </div>
        <Accordion type="single" collapsible>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
