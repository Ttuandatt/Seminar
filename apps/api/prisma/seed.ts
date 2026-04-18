import 'dotenv/config';
import { PrismaClient, Role, PoiCategory, PoiStatus, TourStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { seedSupportedLanguages } from './seed/languages.seed';

const prisma = new PrismaClient();
const DATA_JSON_PATH = path.join(__dirname, 'seeds', 'data.json');

async function seedFromJson() {
    const raw = fs.readFileSync(DATA_JSON_PATH, 'utf-8');
    const data = JSON.parse(raw);

    console.log(`📦 Loading from data.json (exported ${data.exportedAt})`);
    console.log(`   ${data.users.length} users, ${data.pois.length} POIs, ${data.tours.length} tours`);

    // Delete in dependency order
    await prisma.tourPoi.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.poiMedia.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.viewHistory.deleteMany();
    await prisma.triggerLog.deleteMany();
    await prisma.poi.deleteMany();
    await prisma.shopOwner.deleteMany();
    await prisma.touristUser.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.revokedToken.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Import users
    for (const user of data.users) {
        const { shopOwnerProfile, touristProfile, ...userData } = user;
        await prisma.user.create({
            data: {
                ...userData,
                ...(shopOwnerProfile ? {
                    shopOwnerProfile: {
                        create: (() => {
                            const { userId, ...rest } = shopOwnerProfile;
                            return rest;
                        })(),
                    },
                } : {}),
                ...(touristProfile ? {
                    touristProfile: {
                        create: (() => {
                            const { userId, ...rest } = touristProfile;
                            return rest;
                        })(),
                    },
                } : {}),
            },
        });
    }
    console.log(`✅ Imported ${data.users.length} users`);

    // Import POIs
    for (const poi of data.pois) {
        const { media, ...poiData } = poi;
        await prisma.poi.create({
            data: {
                ...poiData,
                ...(media?.length ? {
                    media: {
                        create: media.map((m: any) => {
                            const { poiId, ...rest } = m;
                            return rest;
                        }),
                    },
                } : {}),
            },
        });
    }
    console.log(`✅ Imported ${data.pois.length} POIs`);

    // Import tours
    for (const tour of data.tours) {
        const { tourPois, ...tourData } = tour;
        await prisma.tour.create({
            data: {
                ...tourData,
                ...(tourPois?.length ? {
                    tourPois: {
                        create: tourPois.map((tp: any) => {
                            const { id, tourId, createdAt, updatedAt, ...rest } = tp;
                            return rest;
                        }),
                    },
                } : {}),
            },
        });
    }
    console.log(`✅ Imported ${data.tours.length} tours`);
}

async function seedHardcoded() {
    console.log('📝 No data.json found, using hardcoded seed data...');

    // ─── Admin User ─────────────────────────
    const adminPw = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gpstours.vn' },
        update: {},
        create: {
            email: 'admin@gpstours.vn',
            passwordHash: adminPw,
            fullName: 'Admin GPS Tours',
            role: Role.ADMIN,
        },
    });
    console.log(`✅ Admin: ${admin.email}`);

    // ─── Shop Owner ─────────────────────────
    const soPw = await bcrypt.hash('shop123', 12);
    const shopOwner = await prisma.user.upsert({
        where: { email: 'bunmam@gpstours.vn' },
        update: {},
        create: {
            email: 'bunmam@gpstours.vn',
            passwordHash: soPw,
            fullName: 'Nguyễn Văn Tùng',
            role: Role.SHOP_OWNER,
            shopOwnerProfile: {
                create: {
                    shopName: 'Quán Bún Mắm Tùng',
                    shopAddress: '144 Vĩnh Khánh, Q.4',
                    phone: '0901234567',
                },
            },
        },
    });
    console.log(`✅ Shop Owner: ${shopOwner.email}`);

    // ─── Tourist ────────────────────────────
    const touristPw = await bcrypt.hash('tourist123', 12);
    const tourist = await prisma.user.upsert({
        where: { email: 'tourist@example.com' },
        update: {},
        create: {
            email: 'tourist@example.com',
            passwordHash: touristPw,
            fullName: 'John Tourist',
            role: Role.TOURIST,
            touristProfile: {
                create: {
                    displayName: 'John',
                    languagePref: 'EN',
                },
            },
        },
    });
    console.log(`✅ Tourist: ${tourist.email}`);

    // ─── POIs (Vĩnh Khánh Street) ──────────
    const pois = await Promise.all([
        prisma.poi.create({
            data: {
                nameVi: 'Quán Bún Mắm Tùng',
                nameEn: 'Bun Mam Tung Restaurant',
                descriptionVi: 'Quán bún mắm nổi tiếng nhất Vĩnh Khánh với nước dùng đậm đà từ mắm cá linh.',
                descriptionEn: 'The most famous bun mam restaurant on Vinh Khanh with rich broth from fermented fish.',
                latitude: 10.7575,
                longitude: 106.6993,
                triggerRadius: 20,
                category: PoiCategory.DINING,
                status: PoiStatus.ACTIVE,
                createdById: admin.id,
                ownerId: shopOwner.id,
            },
        }),
        prisma.poi.create({
            data: {
                nameVi: 'Ốc Đào',
                nameEn: 'Oc Dao Snail Restaurant',
                descriptionVi: 'Quán ốc lâu đời với hơn 50 món ốc các loại, bao gồm ốc hương nướng mỡ hành.',
                descriptionEn: 'Long-established snail restaurant with over 50 snail dishes.',
                latitude: 10.7572,
                longitude: 106.6990,
                triggerRadius: 15,
                category: PoiCategory.STREET_FOOD,
                status: PoiStatus.ACTIVE,
                createdById: admin.id,
            },
        }),
        prisma.poi.create({
            data: {
                nameVi: 'Hải Sản Bé Mặn',
                nameEn: 'Be Man Seafood',
                descriptionVi: 'Nhà hàng hải sản tươi sống với cua, ghẹ, tôm hùm và các món lẩu đặc biệt.',
                descriptionEn: 'Fresh seafood restaurant with crabs, lobsters, and special hotpots.',
                latitude: 10.7568,
                longitude: 106.6988,
                triggerRadius: 15,
                category: PoiCategory.DINING,
                status: PoiStatus.ACTIVE,
                createdById: admin.id,
            },
        }),
        prisma.poi.create({
            data: {
                nameVi: 'Chùa Xá Lợi',
                nameEn: 'Xa Loi Pagoda',
                descriptionVi: 'Ngôi chùa lịch sử xây năm 1956, nổi tiếng với tháp chuông 7 tầng cao 32m.',
                descriptionEn: 'Historic pagoda built in 1956, famous for its 7-story 32m bell tower.',
                latitude: 10.7800,
                longitude: 106.6925,
                triggerRadius: 30,
                category: PoiCategory.CULTURAL_LANDMARKS,
                status: PoiStatus.ACTIVE,
                createdById: admin.id,
            },
        }),
        prisma.poi.create({
            data: {
                nameVi: 'Cà Phê Vợt Sài Gòn',
                nameEn: 'Saigon Filter Coffee',
                descriptionVi: 'Quán cà phê vợt truyền thống hơn 30 năm, giữ nguyên cách pha cà phê cổ điển.',
                descriptionEn: 'Traditional 30-year-old filter coffee shop preserving classic brewing methods.',
                latitude: 10.7560,
                longitude: 106.6995,
                triggerRadius: 10,
                category: PoiCategory.CAFES_DESSERTS,
                status: PoiStatus.ACTIVE,
                createdById: admin.id,
            },
        }),
    ]);
    console.log(`✅ Created ${pois.length} POIs`);

    // ─── Tour ───────────────────────────────
    const tour = await prisma.tour.create({
        data: {
            nameVi: 'Tour Ẩm thực Vĩnh Khánh',
            nameEn: 'Vinh Khanh Food Street Tour',
            descriptionVi: 'Khám phá con phố ẩm thực nổi tiếng nhất Sài Gòn với các món ốc, hải sản, bún mắm.',
            descriptionEn: 'Discover Saigon\'s most famous food street with snails, seafood, and bun mam.',
            estimatedDuration: 90,
            status: TourStatus.ACTIVE,
            createdById: admin.id,
            tourPois: {
                create: pois.map((poi, index) => ({
                    poiId: poi.id,
                    orderIndex: index,
                })),
            },
        },
    });
    console.log(`✅ Tour: ${tour.nameVi} (${pois.length} POIs)`);
}

async function main() {
    console.log('🌱 Seeding database...');

    await seedSupportedLanguages(prisma);

    try {
        if (fs.existsSync(DATA_JSON_PATH)) {
            await seedFromJson();
        } else {
            await seedHardcoded();
        }
    } catch (error) {
        console.warn('⚠️  Seed data import failed, skipping data seed (languages already seeded)');
        console.warn('Error:', error instanceof Error ? error.message : String(error));
    }

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────');
    console.log('Admin:      admin@gpstours.vn / admin123');
    console.log('Shop Owner: bunmam@gpstours.vn / shop123');
    console.log('Tourist:    tourist@example.com / tourist123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });