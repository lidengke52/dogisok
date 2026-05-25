export type Article = {
  slug: string
  title: string
  excerpt: string
  category: string
  categorySlug: string
  readTime: number
  date: string
  image: string
  author: string
  ageTag?: string
  skillTag?: string
}

export const articles: Article[] = [
  {
    slug: "can-dogs-eat-strawberries",
    title: "Can Dogs Eat Strawberries? A Complete Safety Guide",
    excerpt:
      "Strawberries are safe for dogs in moderation and packed with vitamin C. Here is exactly how much to feed, what to avoid, and the warning signs to watch for.",
    category: "Can Eat",
    categorySlug: "can-eat",
    readTime: 6,
    date: "2026-04-18",
    image: "/images/article-food.jpg",
    author: "Dr. Emily Carter, DVM",
    ageTag: "Adult",
    skillTag: "Nutrition",
  },
  {
    slug: "puppy-first-vet-visit",
    title: "Your Puppy's First Vet Visit: What Every New Owner Should Know",
    excerpt:
      "From vaccinations to parasite screening, here is a step-by-step guide to making the first visit stress-free for both you and your new puppy.",
    category: "Knowledge",
    categorySlug: "knowledge",
    readTime: 8,
    date: "2026-04-15",
    image: "/images/article-health.jpg",
    author: "Dr. Marcus Lin, DVM",
    ageTag: "Puppy",
    skillTag: "Health",
  },
  {
    slug: "basic-obedience-training",
    title: "5 Obedience Commands Every Dog Should Master",
    excerpt:
      "Sit, stay, come, down, and heel — the five foundational commands that build a lifetime of trust and safety with your dog.",
    category: "Knowledge",
    categorySlug: "knowledge",
    readTime: 10,
    date: "2026-04-12",
    image: "/images/article-training.jpg",
    author: "Sarah Johnson, CPDT-KA",
    ageTag: "Adult",
    skillTag: "Behavior",
  },
  {
    slug: "new-puppy-checklist",
    title: "The Ultimate New Puppy Checklist for the First 30 Days",
    excerpt:
      "Bringing home a new puppy? This 30-day plan covers feeding, sleep, socialization, and early training to set them up for success.",
    category: "Knowledge",
    categorySlug: "knowledge",
    readTime: 12,
    date: "2026-04-10",
    image: "/images/article-puppy.jpg",
    author: "Dr. Emily Carter, DVM",
    ageTag: "New Home",
    skillTag: "Care",
  },
  {
    slug: "grooming-long-haired-dogs",
    title: "Grooming Long-Haired Breeds: A Gentle Weekly Routine",
    excerpt:
      "Samoyeds, Huskies, and Golden Retrievers need dedicated grooming to stay healthy. Here is a vet-approved weekly routine.",
    category: "Can Do",
    categorySlug: "can-do",
    readTime: 7,
    date: "2026-04-05",
    image: "/images/article-grooming.jpg",
    author: "Jessica Park, Certified Groomer",
    ageTag: "Adult",
    skillTag: "Care",
  },
  {
    slug: "chocolate-poisoning-signs",
    title: "Chocolate Poisoning in Dogs: Signs, Severity, and What to Do",
    excerpt:
      "Chocolate is toxic to dogs. Learn which types are most dangerous, how much is too much, and the emergency steps that could save your dog's life.",
    category: "Cannot Eat",
    categorySlug: "cannot-eat",
    readTime: 5,
    date: "2026-04-01",
    image: "/images/article-food.jpg",
    author: "Dr. Marcus Lin, DVM",
    ageTag: "Adult",
    skillTag: "Health",
  },
]

export const categories = [
  {
    slug: "can-eat",
    title: "Can They Eat It?",
    description: "Safe foods, foods to avoid, and feeding guidelines",
    count: 248,
  },
  {
    slug: "can-do",
    title: "Can They Do It?",
    description: "Activities, travel, home life, and safety",
    count: 186,
  },
  {
    slug: "knowledge",
    title: "Knowledge Library",
    description: "12 expert-curated topics covering every life stage",
    count: 412,
  },
  {
    slug: "medication-check",
    title: "Medication Check",
    description: "Search by drug, condition, or body area",
    count: 94,
  },
  {
    slug: "symptom-check",
    title: "Symptom Check",
    description: "Multi-factor self-assessment tool",
    count: 156,
  },
]
