-- 种子数据：示例文章
insert into public.articles (slug, title, excerpt, content, cover_image, category, read_time, published, featured)
values
  (
    'can-dogs-eat-strawberries',
    'Can Dogs Eat Strawberries? A Complete Safety Guide',
    'Strawberries are safe for dogs in moderation. Learn about the right portion, preparation, and potential risks.',
    'Strawberries are a safe and healthy treat for most dogs. They contain fiber, vitamin C, and antioxidants that can support your dog''s overall health. However, moderation is key — too many strawberries can cause stomach upset due to their natural sugar content.\n\n## How Much is Safe?\n\nFor small dogs, 1-2 small strawberries per day is a good limit. Medium to large dogs can have 3-4 berries. Always wash them thoroughly and remove the stems.\n\n## Risks to Watch For\n\n- Choking hazard for small breeds (cut into pieces)\n- Added sugar in processed strawberry products\n- Allergic reactions (rare but possible)',
    '/images/article-food.jpg',
    'food',
    4,
    true,
    true
  ),
  (
    'dog-vaccination-schedule',
    'Complete Dog Vaccination Schedule: Puppy to Adult',
    'A detailed vaccination timeline every dog owner should follow to keep their pup healthy and protected.',
    'Vaccinations are the foundation of preventive care for your dog. Following the correct schedule ensures your pet develops strong immunity against common diseases.\n\n## Puppy Vaccinations (6-16 weeks)\n\n- 6-8 weeks: DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)\n- 10-12 weeks: DHPP booster\n- 12-16 weeks: Rabies, DHPP final\n\n## Adult Dog Boosters\n\nMost vaccines require annual or triennial boosters. Consult your vet for a personalized plan.',
    '/images/article-health.jpg',
    'health',
    6,
    true,
    true
  ),
  (
    'teaching-dog-sit-command',
    'How to Teach Your Dog to Sit in 5 Minutes',
    'A simple step-by-step guide to teach any dog the most fundamental obedience command.',
    'Teaching "sit" is the foundation of all dog training. Most dogs can learn it in one short session.\n\n## Step by Step\n\n1. Hold a treat close to your dog''s nose\n2. Slowly move the treat up and back over their head\n3. As their nose follows, their bottom will naturally lower\n4. The moment their bottom touches the ground, say "sit" and give the treat\n5. Repeat 5-10 times, then take a break\n\n## Pro Tips\n\n- Train in short 5-minute sessions\n- Use high-value treats initially\n- Practice in different environments',
    '/images/article-training.jpg',
    'training',
    5,
    true,
    true
  ),
  (
    'new-puppy-first-week',
    'New Puppy? Your Complete First Week Survival Guide',
    'Everything you need to prepare for your puppy''s first seven days at home.',
    'Bringing home a new puppy is exciting but overwhelming. Here''s how to navigate the critical first week.\n\n## Day 1: Setting Up\n\n- Prepare a quiet safe space\n- Introduce to family members slowly\n- Let them explore at their own pace\n\n## Days 2-3: Routine\n\nStart establishing feeding, potty, and sleep schedules. Consistency is crucial.\n\n## Days 4-7: Socialization\n\nBegin gentle exposure to new sounds, textures, and (vaccinated) dogs.',
    '/images/article-puppy.jpg',
    'puppy',
    7,
    true,
    false
  ),
  (
    'dog-breed-comparison-table',
    'Dog Breed Comparison: Golden Retriever vs Labrador vs Poodle',
    'A comprehensive comparison table of three popular dog breeds to help you choose the perfect companion.',
    '# Dog Breed Comparison Guide

This comprehensive table shows how three popular dog breeds compare across key characteristics to help you choose the right one for your lifestyle.

## Breed Characteristics

| Trait | Golden Retriever | Labrador Retriever | Standard Poodle |
|-------|------------------|-------------------|-----------------|
| **Size** | 55-75 lbs | 55-80 lbs | 45-70 lbs |
| **Lifespan** | 10-12 years | 10-12 years | 12-15 years |
| **Energy Level** | Very High | Very High | High |
| **Trainability** | Excellent | Excellent | Excellent |
| **Shedding** | Heavy | Heavy | Minimal |
| **Grooming Need** | Moderate | Moderate | High (Professional) |
| **Good with Kids** | Excellent | Excellent | Good |
| **Good with Dogs** | Excellent | Excellent | Good |
| **Barking Tendency** | Low | Low | Moderate |
| **Apartment Friendly** | Moderate | Moderate | Good |

## Detailed Comparison

### Golden Retriever
Golden Retrievers are renowned for their gentle nature and eagerness to please. They excel as family companions and service dogs due to their intelligence and calm temperament.

**Pros:**
- Extremely friendly and patient with children
- Highly trainable for service and therapy work
- Excellent swimmers with natural retrieving instinct
- Consistent, predictable personality

**Cons:**
- Require extensive daily exercise
- Heavy shedding year-round
- Prone to hip dysplasia
- Need significant socialization

### Labrador Retriever
Labs are America''s most popular dog breed for good reason. They combine athleticism, loyalty, and a fun-loving spirit.

**Pros:**
- Incredibly loyal and devoted family dogs
- Versatile workers (service, therapy, search and rescue)
- Durable and robust build
- Eager to please and respond well to training

**Cons:**
- High exercise requirements
- Significant shedding
- Can become destructive if bored
- Prone to obesity without proper exercise

### Standard Poodle
Poodles are highly intelligent and athletic dogs with minimal shedding coats.

**Pros:**
- Hypoallergenic coat (minimal shedding)
- Highly intelligent - ranked 2nd in dog intelligence
- Elegant appearance with various grooming options
- Excellent in dog sports and competitions

**Cons:**
- Require professional grooming every 4-6 weeks
- Expensive grooming costs
- Can have hair not fur sensitivity
- May be aloof with strangers

## Which Breed Is Right For You?

**Choose a Golden Retriever if:**
- You want a gentle family dog that loves children
- You have an active lifestyle with outdoor activities
- You don''t mind regular grooming
- You want a highly trainable and eager-to-please companion

**Choose a Labrador if:**
- You need a versatile working dog
- You want a loyal, energetic companion
- You have access to open spaces for running
- You''re experienced with large, active dogs

**Choose a Poodle if:**
- You have allergies or prefer minimal shedding
- You''re willing to invest in professional grooming
- You want an intelligent, athletic dog
- You enjoy dog sports or showing

## Health Considerations

All three breeds can live 10-15 years with proper care. Common health issues include:
- **Hip Dysplasia** - all three breeds
- **Eye Problems** - especially in Goldens
- **Bloat** - large breed concern for all three
- **Ear Infections** - especially in Retrievers with floppy ears

Regular veterinary checkups and responsible breeding practices help minimize these risks.',
    '/images/article-breed-comparison.jpg',
    'knowledge',
    12,
    true,
    false
  )
on conflict (slug) do nothing;
