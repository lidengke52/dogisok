import csv
import re
import sys

def slugify(text):
    """Convert text to slug format"""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def parse_csv():
    """Parse the dog breeds CSV file"""
    breeds = []
    
    with open('/vercel/share/v0-project/data/dog-breeds-full.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, 1):
            breed = {
                'cn_name': row.get('Dog breeds', '').strip() or None,
                'name': row.get('English name', '').strip() or row.get('Dog breeds', '').strip(),
                'summary': row.get('summary', '').strip() or None,
                'origin': row.get('Origins', '').strip() or None,
                'lifespan': row.get('Lifetime', '').strip() or None,
                'weight': row.get('Weight range', '').strip() or None,
                'height': row.get('Shoulder height range', '').strip() or None,
                'temperament': [t.strip() for t in (row.get('Character key words', '') or '').split(',') if t.strip()],
                'care_notes': [c.strip() for c in (row.get('Precautions for feeding', '') or '').split(';') if c.strip()],
                'common_health': [h.strip() for h in (row.get('Common health issues', '') or '').split(',') if h.strip()],
                'group_name': row.get('Grouping', '').strip() or 'Non-Sporting',
                'size': row.get('body shape', '').strip().capitalize() or 'Medium',
                'trainability': int(row.get('training', 3) or 3),
                'shedding': int(row.get('Hair shedding', 3) or 3),
                'exercise': int(row.get('Sports needs', 3) or 3),
                'good_with_kids': row.get('Is it appropriate to get along with children', '').lower() in ['yes', '是'],
                'display_order': idx,
                'is_published': True,
            }
            breed['slug'] = slugify(breed['name'])
            breeds.append(breed)
    
    return breeds

if __name__ == '__main__':
    breeds = parse_csv()
    print(f"Total breeds parsed: {len(breeds)}")
    # Print SQL for first 5 breeds as test
    for breed in breeds[:5]:
        print(f"Name: {breed['name']}, CN: {breed['cn_name']}, Slug: {breed['slug']}")
