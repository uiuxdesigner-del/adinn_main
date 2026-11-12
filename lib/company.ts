/**
 * Company facts and draft copy used across pages.
 * Sources and open questions: CONTENT-SOURCES.md.
 * Figures are as stated on adinn.com (undated); confirm before publishing.
 */

export const networkFigures = [
  { value: "550+", label: "hoardings around South India" },
  { value: "250+", label: "mobile vans" },
  { value: "150+", label: "LED display vehicles" },
] as const;

/** Brand names shown as logos on adinn.com. Limited to names that were clear. */
export const brandNames = [
  "Amul",
  "Havells",
  "KFC",
  "TVS",
  "DBS",
  "Milky Mist",
  "Daikin",
  "Honda",
  "Burger King",
  "Royal Enfield",
  "Indian Overseas Bank",
  "Maruti Suzuki",
] as const;

export const situations = [
  {
    title: "Launching a product in a city",
    text: "Hoardings and street media make the launch visible. Roadshow vans and LED vehicles carry it into neighbourhoods. Events let people see the product for themselves.",
    teams: "Outdoor / OOH, Roadshows, Events & Activations",
  },
  {
    title: "Taking a campaign to many towns",
    text: "Roadshow vehicles are GPS-enabled and RTO-approved. Wall painting is geo-tagged, so each location is recorded. Printed material travels with the campaign.",
    teams: "Roadshows, Wall Advertising, Printing & POP",
  },
  {
    title: "Keeping every store consistent",
    text: "Signage is designed, produced and installed. Fixtures, including modular shop-in-shop units, are made on advanced machinery so stores match. Posters and leaflets finish the look.",
    teams: "Signage & Retail Branding, Retail Fixtures, Printing & POP",
  },
  {
    title: "Running an event or activation",
    text: "Creative, fabrication and trained on-ground teams are in-house, so a stage, stall or display can be planned and built together.",
    teams: "Events & Activations",
  },
  {
    title: "Keeping digital in step with the street",
    text: "Search, performance marketing, content and websites, so what people see outside is what they find online.",
    teams: "Digital Marketing",
  },
] as const;

export const stages = [
  {
    title: "Understand the brief",
    text: "We start with what you want to achieve and who you want to reach.",
  },
  {
    title: "Design and make",
    text: "Creative work, fabrication, fixtures and printing are produced for the brief.",
  },
  {
    title: "Install and deploy",
    text: "Signage is installed, vehicles are deployed and event teams are on site.",
  },
  {
    title: "Check on the ground",
    text: "Where the service allows, roadshows are GPS-enabled and wall work is geo-tagged.",
  },
] as const;

/** Core values as stated on adinn.com, lightly reworded. */
export const coreValues = [
  {
    title: "Reliability",
    text: "We deliver what we promise, so clients can depend on us.",
  },
  {
    title: "Respect",
    text: "We value clients, partners and teammates, and welcome ideas from everyone.",
  },
  {
    title: "Excellence",
    text: "We hold strategy, creativity and execution to high standards and aim for results that can be measured.",
  },
  {
    title: "Integrity",
    text: "We work openly and honestly, and we are accountable for our work.",
  },
  {
    title: "Innovation",
    text: "We look for fresh ways to answer a brief.",
  },
  {
    title: "Teamwork",
    text: "We combine our strengths, with each other and with clients.",
  },
] as const;

/** Culture values as stated on the adinn.com Careers page, lightly reworded. */
export const cultureValues = [
  { title: "Growth", text: "Ongoing learning and skill development." },
  { title: "Innovation", text: "Room to explore bold ideas." },
  { title: "Trust", text: "Autonomy to do good work." },
  { title: "Collaboration", text: "Everyone’s input is valued." },
  { title: "Balance", text: "Work-life balance supports good creative work." },
  { title: "Purpose", text: "Every role adds real value." },
] as const;
