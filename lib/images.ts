/**
 * Photography registry. All photos are third-party images used illustratively.
 * They are NOT Adinn projects and the people shown are NOT Adinn staff.
 * Licence details: IMAGE-SOURCES.md. Credits are shown in the footer.
 */
export type ImageKey =
  | "hero"
  | "outdoor"
  | "roadshows"
  | "events"
  | "signage"
  | "fixtures"
  | "printing"
  | "wall"
  | "digital"
  | "production";

export type Photo = {
  src: string;
  alt: string;
  /** Short factual description used in captions. */
  subject: string;
  /** CSS object-position for crops. */
  position: string;
  credit: { author: string; license: string; page: string };
};

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${file}`;

export const photos: Record<ImageKey, Photo> = {
  hero: {
    src: "/images/roadshows-commercial-street-lights-bangalore.jpg",
    alt: "A shopping street lit with strings of festival lights above shop signs on Commercial Street, Bangalore",
    subject: "Commercial Street, Bangalore",
    position: "50% 45%",
    credit: {
      author: "Saad Faruque",
      license: "CC BY-SA 2.0",
      page: commons("Commercial_Street,_Bangalore_(7870991636).jpg"),
    },
  },
  outdoor: {
    src: "/images/outdoor-anna-salai-chennai.jpg",
    alt: "Busy Anna Salai in Chennai seen from above, with a large hoarding beside the road and autorickshaws and buses below",
    subject: "Anna Salai, Chennai",
    position: "60% 50%",
    credit: {
      author: "L.vivian.richard",
      license: "Public domain",
      page: commons("Anna_Salai_view.jpg"),
    },
  },
  roadshows: {
    src: "/images/street-commercial-street-bangalore.jpg",
    alt: "Shops with vertical signboards along a busy Commercial Street in Bangalore on a clear day",
    subject: "Commercial Street, Bangalore",
    position: "50% 50%",
    credit: {
      author: "oatsy40",
      license: "CC BY 2.0",
      page: commons("Commercial_Street_-_Bangalore_(24047126747).jpg"),
    },
  },
  events: {
    src: "/images/events-brand-display-chennai.jpg",
    alt: "Visitors gathered around a branded car display during an event at a Chennai mall",
    subject: "a brand display at a Chennai mall event",
    position: "50% 55%",
    credit: {
      author: "Aravind Sivaraj",
      license: "CC BY-SA 3.0",
      page: commons("Lotus-Renault_F1_car_in_display_during_an_event.jpg"),
    },
  },
  signage: {
    src: "/images/signage-brigade-road-bangalore.jpg",
    alt: "Fashion store fronts with large signage along Brigade Road, Bangalore, with hoardings above",
    subject: "Brigade Road, Bangalore",
    position: "40% 50%",
    credit: {
      author: "Ashwin Kumar",
      license: "CC BY-SA 2.0",
      page: commons("Brigade_Road_on_26_May_2013.jpg"),
    },
  },
  fixtures: {
    src: "/images/fixtures-store-display-bangalore.jpg",
    alt: "Products arranged on lit shelving inside a store in Bangalore",
    subject: "an in-store display in Bangalore",
    position: "50% 50%",
    credit: {
      author: "Gpkp",
      license: "CC BY-SA 4.0",
      page: commons("Shoppers_Stop,_Bannerghatta_Road,_Bangalore_(2025)_05.jpg"),
    },
  },
  printing: {
    src: "/images/printing-offset-press-bhubaneswar.jpg",
    alt: "Offset printing machines and rolls of paper in a press hall",
    subject: "an offset press in Bhubaneswar",
    position: "50% 55%",
    credit: {
      author: "Subhashish Panigrahi",
      license: "CC BY-SA 4.0",
      page: commons(
        "Offset_printers_in_Sambad_Press_in_Bhubaneswar,_Odisha,_India.jpg",
      ),
    },
  },
  wall: {
    src: "/images/wall-painted-advertisement-vijayawada.jpg",
    alt: "A painted advertisement on the wall of a shop on a Vijayawada street",
    subject: "a painted wall advertisement in Vijayawada",
    position: "50% 40%",
    credit: {
      author: "Saiphani02",
      license: "CC BY-SA 4.0",
      page: commons("Vijaya_Milk_wall_advertisement.jpg"),
    },
  },
  digital: {
    src: "/images/office-tidel-park-chennai.jpg",
    alt: "The glass-fronted Tidel Park office complex in Chennai under a blue sky",
    subject: "Tidel Park, an office complex in Chennai",
    position: "50% 45%",
    credit: {
      author: "PlaneMad",
      license: "CC BY-SA 2.5",
      page: commons("Tidel_Park.jpg"),
    },
  },
  production: {
    src: "/images/production-sign-painter-wayanad.jpg",
    alt: "A painter finishing a yellow roadside sign beside a highway in Wayanad, Kerala",
    subject: "a sign painter at work in Wayanad, Kerala",
    position: "50% 55%",
    credit: {
      author: "Ingo Mehling",
      license: "CC BY-SA 4.0",
      page: commons("Wayanad_-_Highway_Sign_Painter.jpg"),
    },
  },
};
