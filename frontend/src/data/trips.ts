// Import images for Trip 1
import trip1_1 from '../assets/Products/Trip-1/T1.jpg';
import trip1_2 from '../assets/Products/Trip-1/T11.jpg';
import trip1_3 from '../assets/Products/Trip-1/T111.jpg';
import trip1_4 from '../assets/Products/Trip-1/T1111.webp';
import trip1_5 from '../assets/Products/Trip-1/T11111.jpg';

// Import images for Trip 2
import trip2_1 from '../assets/Products/Trip-2/T2.jpg';
import trip2_2 from '../assets/Products/Trip-2/T22.jpg';
import trip2_3 from '../assets/Products/Trip-2/T222.jpg';
import trip2_4 from '../assets/Products/Trip-2/T2222.jpg';
import trip2_5 from '../assets/Products/Trip-2/T22222.jpg';


// Import images for Trip 3
import trip3_1 from '../assets/Products/Trip-3/T3.jpg';
import trip3_2 from '../assets/Products/Trip-3/T33.webp';
import trip3_3 from '../assets/Products/Trip-3/T333.jpg';
import trip3_4 from '../assets/Products/Trip-3/T3333.jpg';
import trip3_5 from '../assets/Products/Trip-3/T33333.jpg';

// Import images for Trip 4
import trip4_1 from '../assets/Products/Trip-4/T4.jpg';
import trip4_2 from '../assets/Products/Trip-4/T44.jpg';
import trip4_3 from '../assets/Products/Trip-4/T444.jpg';
import trip4_4 from '../assets/Products/Trip-4/T4444.jpg';
import trip4_5 from '../assets/Products/Trip-4/T44444.jpg';

// Import images for Trip 5
import trip5_1 from '../assets/Products/Trip-5/T5.jpg';
import trip5_2 from '../assets/Products/Trip-5/T55.jpg';
import trip5_3 from '../assets/Products/Trip-5/T555.jpg';
import trip5_4 from '../assets/Products/Trip-5/T5555.jpg';
import trip5_5 from '../assets/Products/Trip-5/T55555.jpg';

// Import images for Trip Sahara
import trip6_1 from '../assets/Products/Trip-Sahara/T6.jpg'
import trip6_2 from '../assets/Products/Trip-Sahara/T66.jpg'
import trip6_3 from '../assets/Products/Trip-Sahara/T666.jpg'
import trip6_4 from '../assets/Products/Trip-Sahara/T6666.webp'
import trip6_5 from '../assets/Products/Trip-Sahara/T66666.jpg'


export interface Trip {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  amenities: string[];
  images: string[];
  coordinates?: [number, number]; // [lat, lng]
  isPremium?: boolean;
  isCovered?: boolean;
  circuit?: string[];
  date?: string;
  registrationClosed?: boolean;
  fixedCost?: number;
  costPerPerson?: number;
  registrationDeadline?: string;
}

export const tripsData: Trip[] = [
  {
    id: 'trip-1',
    title: 'Historic Tunis City Tour',
    location: 'Tunis, Tunisia',
    price: 30,
    rating: 4.8,
    reviews: 124,
    description: 'Discover the treasures of Tunis through a journey to the iconic Bardo Museum, the historic Medina of Tunis, and the charming village of Sidi Bou Said. Experience Tunisia’s rich heritage, vibrant culture, and stunning Mediterranean views in one unforgettable day.',
    amenities: ['Guided Tour', 'Museum Tickets', 'Lunch Included', 'Transport'],
    images: [trip1_3, trip1_5, trip1_2, trip1_1, trip1_4],
    coordinates: [36.8065, 10.1815], // Tunis
    isCovered: true,
    circuit: ['Bardo Museum', 'Medina of Tunis', 'Sidi Bou Said'],
    date: 'July 11, 2026',
    fixedCost: 200,
    costPerPerson: 10,
    registrationDeadline: 'July 12, 2026'
  },
  {
    id: 'trip-5',
    title: 'Kuriat Island',
    location: 'Kuriat Island, Tunisia',
    price: 35,
    rating: 4.9,
    reviews: 32,
    description: 'Sail away to the breathtaking Kuriat Islands on a relaxing boat tour. Spot dolphins in their natural habitat, enjoy crystal-clear waters, and unwind on a secluded beach paradise far from the crowds for a truly exclusive experience.',
    amenities: ['Transport', 'Boat Tour', 'Lunch Included'],
    images: [trip3_1, trip3_3, trip3_2, trip3_4, trip3_5],
    coordinates: [33.8076, 10.8451], // Kuriat Island
    isCovered: true,
    circuit: ['Kuriat Island'],
    date: 'July 17, 2026',
    registrationDeadline: 'July 17, 2026',
    fixedCost: 300,
    costPerPerson: 12
  },
  {
    id: 'trip-2',
    title: 'El Djem Amphitheater',
    location: 'Mahdia & Monastir,Tunisia',
    price: 30,
    rating: 4.9,
    reviews: 89,
    description: 'Step back in time as you explore the impressive El Jem Amphitheatre, discover the coastal charm of Mahdia, and visit the historic landmarks of Monastir. This journey combines Tunisia’s rich history, cultural heritage, and beautiful Mediterranean scenery.',
    amenities: ['Guided Tour', 'El Jem Amphitheatre Ticket', 'Lunch Included', 'Transport'],
    images: [trip2_4, trip2_2, trip2_3, trip2_1, trip2_5],
    coordinates: [35.5047, 11.0622], // Mahdia
    isCovered: true,
    circuit: ['El Djem Amphitheatre', 'Mahdia', 'Monastir'],
    date: 'July 20, 2026',
    registrationDeadline: 'July 18, 2026',
    fixedCost: 250,
    costPerPerson: 10
  },
  {
    id: 'trip-6',
    title: 'Sahara Desert Safari',
    location: 'Tozeur, Tunisia',
    price: 110,
    rating: 4.8,
    reviews: 156,
    description: 'Experience the magic of the Tunisian Sahara with a journey through Tozeur, the stunning oasis of Chebika, and the famous Ong Jmal. Ride across the golden sand dunes in a thrilling 4x4 adventure and explore iconic filming locations from the legendary Star Wars saga.',
    amenities: ['4x4 Desert Adventure', 'Star Wars Filming Sites', 'Hotel', 'Lanch included', 'Transport Confortable'],
    images: [trip6_1, trip6_2, trip6_3, trip6_4, trip6_5],
    coordinates: [33.4550, 9.0253],
    circuit: ['Tozeur', 'Ong Jmal', 'Starwars Sites ', 'Tameghza'],
    date: 'July 22 & 23, 2026',
    registrationDeadline: 'July 17, 2026',
    fixedCost: 800,
    costPerPerson: 40
  },
  {
    id: 'trip-3',
    title: 'Cap Serrat',
    location: 'Bizerte, Tunisia',
    price: 40,
    rating: 4.7,
    reviews: 56,
    description: 'Embark on an exciting adventure to Cap Serrat, one of Tunisia’s most breathtaking natural gems. Enjoy a thrilling 4x4 experience through scenic trails, discover unspoiled landscapes, and take in spectacular views of the Mediterranean coastline.',
    amenities: ['Private beach', 'Boat & 4x4 Tour', 'Lunch Included', 'Transport'],
    images: [trip5_2, trip5_1, trip5_3, trip5_4, trip5_5],

    coordinates: [37.2746, 9.8739], // Bizerte
    circuit: ['Cap Serrat, Bizerte'],
    date: 'July 26, 2026',
    registrationDeadline: 'July 15, 2026',
    fixedCost: 350,
    costPerPerson: 15
  },
  {
    id: 'trip-4',
    title: 'Camping Adventure',
    location: 'Tunisia',
    price: 25,
    rating: 4.6,
    reviews: 210,
    description: 'Escape into nature for an unforgettable camping experience filled with fun and connection. Enjoy a cozy campfire, live DJ and party vibes, an outdoor movie night, exciting group games, and a karaoke session under the stars.',
    amenities: ['Transport', 'Campfire', 'BBQ Area', 'Tente or cabin', 'DJ Set', 'Outdoor Movie Night', 'Games', 'Karaoke Session', 'dinner & breakfast included'],
    images: [trip4_4, trip4_3, trip4_5, trip4_1, trip4_2],
    coordinates: [33.9197, 8.1335], // Camping Adventure
    isPremium: true,
    isCovered: true,
    circuit: ['Organised Camping Trip'],
    date: 'August 1 & 2, 2026',
    fixedCost: 150,
    costPerPerson: 8
  }
];
