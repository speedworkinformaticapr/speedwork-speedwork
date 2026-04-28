export type Course = {
  id: string
  name: string
  region: 'Metro' | 'North' | 'South' | 'East' | 'West'
  difficulty: 'Pro' | 'Amateur' | 'Mixed'
  holes: number
  price: string
  image: string
  rating: number
  amenities: string[]
}

export const COURSES: Course[] = [
  {
    id: '1',
    name: 'San Juan Municipal Links',
    region: 'Metro',
    difficulty: 'Mixed',
    holes: 18,
    price: '$$',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20course%20sunny',
    rating: 4.8,
    amenities: ['Pro-shop', 'Rentals', 'Restaurant'],
  },
  {
    id: '2',
    name: 'Dorado Beach Footgolf',
    region: 'North',
    difficulty: 'Pro',
    holes: 18,
    price: '$$$',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20green%20ocean',
    rating: 4.9,
    amenities: ['Rentals', 'Restaurant', 'Bar'],
  },
  {
    id: '3',
    name: 'Ponce Greens',
    region: 'South',
    difficulty: 'Amateur',
    holes: 9,
    price: '$',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20course%20trees',
    rating: 4.5,
    amenities: ['Rentals', 'Snack Bar'],
  },
  {
    id: '4',
    name: 'Rio Mar Coastal',
    region: 'East',
    difficulty: 'Pro',
    holes: 18,
    price: '$$$',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20resort',
    rating: 4.7,
    amenities: ['Pro-shop', 'Restaurant', 'Locker Room'],
  },
  {
    id: '5',
    name: 'Aguadilla Hills',
    region: 'West',
    difficulty: 'Mixed',
    holes: 18,
    price: '$$',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20hills',
    rating: 4.6,
    amenities: ['Rentals', 'Restaurant'],
  },
]

export type PlayerRanking = {
  rank: number
  name: string
  handicap: number
  points: number
  trend: 'up' | 'down' | 'same'
  avatar: string
}

export const LEADERBOARD: PlayerRanking[] = [
  {
    rank: 1,
    name: 'Lucas Silva',
    handicap: -2,
    points: 2500,
    trend: 'same',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    rank: 2,
    name: 'Mateus Costa',
    handicap: -1,
    points: 2350,
    trend: 'up',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  {
    rank: 3,
    name: 'João Santos',
    handicap: 0,
    points: 2100,
    trend: 'down',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
  },
  {
    rank: 4,
    name: 'Pedro Alves',
    handicap: 1,
    points: 1950,
    trend: 'up',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
  },
  {
    rank: 5,
    name: 'Gabriel Oliveira',
    handicap: 2,
    points: 1800,
    trend: 'down',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
  },
  {
    rank: 6,
    name: 'Rafael Souza',
    handicap: 2,
    points: 1750,
    trend: 'up',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=6',
  },
  {
    rank: 7,
    name: 'Fernando Lima',
    handicap: 3,
    points: 1600,
    trend: 'same',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=7',
  },
  {
    rank: 8,
    name: 'Diego Ferreira',
    handicap: 4,
    points: 1450,
    trend: 'down',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=8',
  },
  {
    rank: 9,
    name: 'Tiago Pereira',
    handicap: 5,
    points: 1300,
    trend: 'up',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=9',
  },
  {
    rank: 10,
    name: 'Carlos Mendes',
    handicap: 6,
    points: 1150,
    trend: 'down',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=10',
  },
]

export type Event = {
  id: string
  title: string
  date: string
  location: string
  subscribers: number
  category: string
  image: string
}

export const UPCOMING_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Copa Paraná de Footgolf',
    date: '15 de Maio, 2026',
    location: 'Curitiba Golf Club',
    subscribers: 120,
    category: 'Pro & Amador',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20course&color=green',
  },
  {
    id: 'e2',
    title: 'Open de Londrina',
    date: '22 de Junho, 2026',
    location: 'Londrina Resort Greens',
    subscribers: 85,
    category: 'Amador',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20green&color=blue',
  },
  {
    id: 'e3',
    title: 'Desafio Cataratas',
    date: '10 de Julho, 2026',
    location: 'Foz do Iguaçu',
    subscribers: 150,
    category: 'Pro',
    image: 'https://img.usecurling.com/p/600/400?q=nature%20golf&color=green',
  },
  {
    id: 'e4',
    title: 'Circuito Ponta Grossa',
    date: '05 de Agosto, 2026',
    location: 'Ponta Grossa Links',
    subscribers: 60,
    category: 'Iniciantes',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20trees',
  },
  {
    id: 'e5',
    title: 'Maringá Footgolf Classic',
    date: '20 de Setembro, 2026',
    location: 'Maringá Clube',
    subscribers: 110,
    category: 'Misto',
    image: 'https://img.usecurling.com/p/600/400?q=sports%20golf&color=orange',
  },
  {
    id: 'e6',
    title: 'Final Estadual PR',
    date: '15 de Novembro, 2026',
    location: 'Curitiba, PR',
    subscribers: 200,
    category: 'Pro',
    image: 'https://img.usecurling.com/p/600/400?q=golf%20championship&color=black',
  },
]

export const TOURNAMENTS = [
  {
    id: 't1',
    title: 'Puerto Rico Open 2026',
    date: 'April 15-16, 2026',
    location: 'Dorado Beach Footgolf',
    category: 'Pro & Amateur',
    status: 'Upcoming',
  },
  {
    id: 't2',
    title: 'San Juan Spring Classic',
    date: 'May 10, 2026',
    location: 'San Juan Municipal Links',
    category: 'Amateur Only',
    status: 'Upcoming',
  },
  {
    id: 't3',
    title: 'West Coast Challenge',
    date: 'June 22, 2026',
    location: 'Aguadilla Hills',
    category: 'Mixed',
    status: 'Upcoming',
  },
]
