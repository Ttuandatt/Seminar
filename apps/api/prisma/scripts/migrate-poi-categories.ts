import 'dotenv/config';
import { PrismaClient, PoiCategory } from '@prisma/client';

const prisma = new PrismaClient();

const LEGACY_FALLBACKS = new Set<PoiCategory>([
    PoiCategory.DINING,
    PoiCategory.STREET_FOOD,
]);

type CategoryRule = {
    category: PoiCategory;
    keywords: string[];
};

const CATEGORY_RULES: CategoryRule[] = [
    {
        category: PoiCategory.CULTURAL_LANDMARKS,
        keywords: ['chua', 'pagoda', 'temple', 'nha tho', 'cathedral', 'den', 'museum', 'heritage', 'thanh dia', 'historic'],
    },
    {
        category: PoiCategory.OUTDOOR_SCENIC,
        keywords: ['cau', 'bridge', 'song', 'river', 'park', 'cong vien', 'ho', 'lake', 'thac', 'viewpoint', 'skydeck', 'ngoai troi', 'scenic'],
    },
    {
        category: PoiCategory.EXPERIENCES_WORKSHOPS,
        keywords: ['workshop', 'class', 'studio', 'trai nghiem', 'hands-on', 'cooking', 'tour guide', 'course', 'lesson'],
    },
    {
        category: PoiCategory.MARKETS_SPECIALTY,
        keywords: ['cho', 'market', 'bazaar', 'souvenir', 'handicraft', 'dac san', 'specialty store', 'spice', 'grocery'],
    },
    {
        category: PoiCategory.BARS_NIGHTLIFE,
        keywords: ['bar', 'pub', 'nightlife', 'speakeasy', 'cocktail', 'craft beer', 'bia tuoi', 'club', 'karaoke'],
    },
    {
        category: PoiCategory.CAFES_DESSERTS,
        keywords: ['ca phe', 'cafe', 'coffee', 'espresso', 'tra sua', 'tea house', 'dessert', 'bakery', 'cake', 'sweet', 'gelato', 'ice cream'],
    },
    {
        category: PoiCategory.STREET_FOOD,
        keywords: ['street food', 'via he', 'xe day', 'hem', 'quan oc', 'banh trang', 'banh mi', 'banh xeo', 'night market', 'snack'],
    },
];

const normalize = (value?: string | null) =>
    (value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const buildNormalizedText = (parts: Array<string | null | undefined>) =>
    parts
        .map((part) => normalize(part))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

const buildRawText = (parts: Array<string | null | undefined>) =>
    parts
        .map((part) => (part ?? '').toLowerCase())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasWord = (text: string, keyword: string) => {
    const pattern = new RegExp(`(^|\\s|[.,;:!?()\\-/])${escapeRegex(keyword)}($|\\s|[.,;:!?()\\-/])`, 'i');
    return pattern.test(text);
};

const containsKeyword = (keyword: string, normalizedText: string, rawText: string): boolean => {
    const normalizedKeyword = normalize(keyword);
    if (!hasWord(normalizedText, normalizedKeyword)) {
        return false;
    }

    if (normalizedKeyword === 'song') {
        return hasWord(rawText, 'sông') || hasWord(rawText, 'song');
    }

    return true;
};

const classifyPoi = (normalizedText: string, rawText: string, fallback: PoiCategory): PoiCategory => {
    for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some((keyword) => containsKeyword(keyword, normalizedText, rawText))) {
            return rule.category;
        }
    }
    return fallback;
};

const shouldApply = process.argv.includes('--apply') || process.argv.includes('--yes');

async function main() {
    const pois = await prisma.poi.findMany({
        where: { deletedAt: null },
        select: {
            id: true,
            nameVi: true,
            nameEn: true,
            descriptionVi: true,
            descriptionEn: true,
            category: true,
        },
        orderBy: { createdAt: 'asc' },
    });

    const candidates = pois.filter((poi) => LEGACY_FALLBACKS.has(poi.category));

    const updates = candidates
        .map((poi) => {
            const parts = [poi.nameVi, poi.nameEn, poi.descriptionVi, poi.descriptionEn];
            const normalizedText = buildNormalizedText(parts);
            const rawText = buildRawText(parts);
            const desiredCategory = classifyPoi(normalizedText, rawText, poi.category);
            return {
                id: poi.id,
                name: poi.nameVi,
                current: poi.category,
                desired: desiredCategory,
            };
        })
        .filter((entry) => entry.desired !== entry.current);

    if (updates.length === 0) {
        console.log('✅ No POIs require category migration.');
        return;
    }

    const totals = updates.reduce<Record<PoiCategory, number>>((acc, update) => {
        acc[update.desired] = (acc[update.desired] ?? 0) + 1;
        return acc;
    }, {} as Record<PoiCategory, number>);

    console.log('📊 Pending category remap summary:');
    console.table(
        Object.entries(totals).map(([category, count]) => ({ category, count })),
    );

    console.log(`Found ${updates.length} POIs with legacy categories (out of ${candidates.length} candidates).`);

    if (!shouldApply) {
        console.log('Dry run only. Re-run with --apply to persist these changes.');
        console.log('Sample updates:');
        console.table(updates.slice(0, 10));
        return;
    }

    await prisma.$transaction(
        updates.map((update) =>
            prisma.poi.update({
                where: { id: update.id },
                data: { category: update.desired },
            }),
        ),
    );

    console.log(`✅ Updated ${updates.length} POIs. All done!`);
}

main()
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
