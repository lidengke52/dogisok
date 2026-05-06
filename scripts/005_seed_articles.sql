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
    'brushing-your-dog',
    'How Often Should You Brush Your Dog?',
    'Brushing frequency depends on your dog''s coat type. Here is a breakdown by breed group.',
    'Regular brushing keeps your dog''s coat healthy and strengthens your bond. The right frequency depends on their coat type.\n\n## Short-Haired Breeds\n\nOnce a week is usually enough. Use a rubber brush or hound glove.\n\n## Long-Haired Breeds\n\nDaily brushing prevents mats and tangles. Use a slicker brush and wide-tooth comb.\n\n## Double-Coated Breeds\n\n2-3 times per week normally, daily during shedding seasons (spring/fall).',
    '/images/article-grooming.jpg',
    'grooming',
    4,
    true,
    false
  )
on conflict (slug) do nothing;
