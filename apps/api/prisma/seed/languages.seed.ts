import { PrismaClient } from '@prisma/client';

const DEFAULT_LANGUAGES = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    enabled: true,
    supportsText: true,
    supportsTts: true,
    requiresPack: false,
    allowOffline: true,
    defaultVoice: 'vi-VN-HoaiMyNeural',
    fallbackVoice: 'vi-VN-NamMinhNeural',
    priority: 1,
    description: 'Ngôn ngữ mặc định cho nội dung POI tại Việt Nam.',
    region: 'vi-VN',
  },
  {
    code: 'en',
    label: 'English',
    enabled: true,
    supportsText: true,
    supportsTts: true,
    requiresPack: false,
    allowOffline: true,
    defaultVoice: 'en-US-JennyNeural',
    fallbackVoice: 'en-US-GuyNeural',
    priority: 5,
    description: 'Fallback language for international visitors.',
    region: 'en-US',
  },
  {
    code: 'de',
    label: 'Deutsch',
    enabled: true,
    supportsText: true,
    supportsTts: true,
    requiresPack: true,
    allowOffline: false,
    defaultVoice: 'de-DE-KatjaNeural',
    fallbackVoice: 'de-DE-ConradNeural',
    priority: 15,
    description: 'Pilot European language for tour translations.',
    region: 'de-DE',
  },
];

export async function seedSupportedLanguages(prisma: PrismaClient) {
  console.log('🌐 Seeding supported languages...');

  for (const language of DEFAULT_LANGUAGES) {
    const { code, ...data } = language;

    await prisma.supportedLanguage.upsert({
      where: { code },
      update: data,
      create: { code, ...data },
    });
  }

  console.log(`✅ Seeded languages: ${DEFAULT_LANGUAGES.map((lang) => lang.code).join(', ')}`);
}
