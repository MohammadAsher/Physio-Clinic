export interface Service {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  price: string;
  duration: string;
  benefits: string[];
  iconImage?: string; // Path to small icon image for badge
}

export const servicesData: Service[] = [
  {
    id: 1,
    title: "Children Physiotherapy",
    description: "Gentle, playful therapy techniques to support motor development, improve mobility, and address congenital conditions in children.",
    longDescription: "Our children's therapy program is designed to create a nurturing and engaging environment where young patients can develop essential motor skills through play-based activities. Our certified pediatric physiotherapists use evidence-based techniques to address developmental delays, congenital conditions like cerebral palsy, and post-surgical rehabilitation. Each session is tailored to your child's unique needs, ensuring progress while maintaining a fun and comfortable atmosphere. We work closely with parents to provide home exercises and monitor improvement over time.",
    image: '/Assests/children.jpg',
    iconImage: '/Assests/children.jpg',
    price: 'From $80/session',
    duration: '45-60 minutes',
    benefits: [
      'Improved motor skills and coordination',
      'Enhanced cognitive development',
      'Better balance and posture',
      'Increased strength and flexibility',
      'Parent education and support'
    ]
  },
  {
    id: 2,
    title: 'Orthopedic Physiotherapy',
    description: 'Comprehensive care for orthopedic injuries, post-surgical recovery, and musculoskeletal conditions to restore movement and reduce pain.',
    longDescription: 'Our orthopedic physiotherapy program addresses a wide range of musculoskeletal issues including joint replacements, fractures, sprains, strains, and chronic conditions like arthritis. We use evidence-based techniques including manual therapy, therapeutic exercises, and modalities like ultrasound and electrical stimulation to promote healing, restore function, and prevent future injuries. Our therapists work closely with you to develop a personalized treatment plan that gets you back to your active lifestyle as quickly and safely as possible.',
    image: '/Assests/ortho.jpg',
    iconImage: '/Assests/ortho.jpg',
    price: 'From $100/session',
    duration: '45-60 minutes',
    benefits: [
      'Reduced pain and inflammation',
      'Improved joint mobility and strength',
      'Faster recovery from surgery/injury',
      'Enhanced functional independence',
      'Prevention of future injuries'
    ]
  },
  {
    id: 3,
    title: 'Neurological Physiotherapy',
    description: 'Focused rehabilitation for stroke, Parkinson\'s, and spinal cord injuries to regain motor function and independence.',
    longDescription: 'Our neurological rehabilitation program is designed for patients recovering from stroke, traumatic brain injury, spinal cord injury, Parkinson\'s disease, multiple sclerosis, and other neurological conditions. Our specialized therapists use neurodevelopmental techniques, task-specific training, and technology-assisted therapy to promote neuroplasticity and functional recovery. We focus on improving gait, balance, coordination, activities of daily living, and overall independence. Our goal is to help patients regain maximum function and quality of life through intensive, personalized rehabilitation plans.',
    image: '/Assests/neuro.jpg',
    iconImage: '/Assests/neuro.jpg',
    price: 'From $150/session',
    duration: '60-90 minutes',
    benefits: [
      'Regained motor function and coordination',
      'Improved balance and gait training',
      'Enhanced activities of daily living',
      'Neuroplasticity stimulation',
      'Assistive device training and adaptation'
    ]
  },
  {
    id: 4,
    title: 'Sports Physiotherapy',
    description: 'Specialized programs for athletes to prevent injuries, enhance performance, and accelerate recovery from sports-related injuries.',
    longDescription: 'Our sports physiotherapy services cater to athletes of all levels, from weekend warriors to elite competitors. We provide comprehensive injury assessment, rehabilitation, and performance enhancement programs tailored to the specific demands of your sport. Our services include injury prevention screening, sports-specific conditioning, return-to-sport testing, and ongoing performance optimization. We work closely with coaches and trainers to ensure a coordinated approach to your athletic goals while prioritizing long-term health and injury prevention.',
    image: '/Assests/sports.jpg',
    iconImage: '/Assests/sports.jpg',
    price: 'From $120/session',
    duration: '60 minutes',
    benefits: [
      'Injury prevention and screening',
      'Rapid recovery from sports injuries',
      'Sport-specific performance training',
      'Return-to-sport evaluation',
      'Ongoing conditioning and maintenance'
    ]
  },
];

export const heroCarouselImages = [
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920&h=1080&fit=crop',
];
