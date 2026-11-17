/**
 * Client logos. Official logo files, as published on adinn.com (downloaded 2026-11-14),
 * trimmed of empty margins only. Names shown are limited to logos that were clear and complete.
 * `confirmed` must be true for a logo to appear: set it false to withdraw a client immediately.
 * Written permission from each client is still to be recorded (CONTENT-SOURCES.md, item 3).
 */
export type Client = { name: string; file: string; w: number; h: number; confirmed: boolean };

export const clients: Client[] = [
  { name: "Havells", file: "havells", w: 186, h: 127, confirmed: true },
  { name: "Honda", file: "honda", w: 500, h: 113, confirmed: true },
  { name: "Maruti Suzuki", file: "maruti-suzuki", w: 700, h: 124, confirmed: true },
  { name: "Royal Enfield", file: "royal-enfield", w: 700, h: 700, confirmed: true },
  { name: "Daikin", file: "daikin", w: 700, h: 381, confirmed: true },
  { name: "Milky Mist", file: "milky-mist", w: 700, h: 222, confirmed: true },
  { name: "KFC", file: "kfc", w: 500, h: 254, confirmed: true },
  { name: "Burger King", file: "burger-king", w: 540, h: 540, confirmed: true },
  { name: "Indian Overseas Bank", file: "iob", w: 700, h: 279, confirmed: true },
];
