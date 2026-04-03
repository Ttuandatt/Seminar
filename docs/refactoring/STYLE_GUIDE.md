# 📖 Coding Style Guide (Post-Refactor)

**Version**: 1.0  
**Date**: April 3, 2026

---

## 🏗️ Folder Structure Patterns

### Admin App (`apps/admin/src/`)

#### Services Organization

```typescript
// ✅ CORRECT: Organized by domain
services/api/admin/poi.service.ts          // For Admin Pages
services/api/shop-owner/poi.service.ts     // For Shop Owner Pages
services/api/shared/auth.service.ts        // Shared across roles

// ❌ WRONG: Flat structure
services/poi.service.ts
services/adminPoi.service.ts
services/shopOwnerPoi.service.ts
```

**Rule**: Group by domain first, then by role.

#### Components Organization

```typescript
// ✅ CORRECT: Clear separation by role
components/shared/form/PoiFormFields.tsx            // Reusable form fields
components/admin/poi-form/AdminPoiForm.tsx         // Admin-specific POI form
components/shop-owner/poi-form/ShopOwnerPoiForm.tsx // Shop Owner POI form

// ❌ WRONG: Mixed roles
components/PoiForm.tsx
components/PoiFormAdmin.tsx
components/PoiFormShopOwner.tsx
```

**Rule**: Shared → `shared/`, Role-specific → `{role}/`

#### Page Naming

```typescript
// ✅ CORRECT: Descriptive, no prefixes
pages/admin/poi/list.tsx
pages/admin/poi/form.tsx
pages/shop-owner/poi/form.tsx

// ❌ WRONG: Redundant prefixes
pages/AdminPOIListPage.tsx
pages/POIFormPageAdmin.tsx
pages/owner_poi_form_page.tsx
```

**Rule**: Use folder hierarchy + descriptive lowercase names.

---

### Mobile App (`apps/mobile/src/`)

#### Services Organization

```typescript
// ✅ CORRECT: Grouped by API domain
services/api/public.service.ts      // Public endpoints (no auth)
services/api/tourist.service.ts     // Tourist-specific endpoints
services/api/auth.service.ts         // Auth endpoints

// ❌ WRONG: One mega service
services/api.ts (1000+ lines)
```

**Rule**: One service per API domain.

#### Screens vs Components

```typescript
// ✅ CORRECT: Screens = full pages, Components = reusables
screens/poi/POIDetailScreen.tsx              // Full screen
components/poi/POICard.tsx                  // Reusable card
components/poi/POIImageCarousel.tsx         // Reusable carousel

// ❌ WRONG: Components in screens or vice versa
screens/POICard.tsx
components/POIDetailScreen.tsx
```

**Rule**: Screens at `screens/`, components inside `components/`.

#### Hooks Organization

```typescript
// ✅ CORRECT: Each hook in hooks folder with clear name
hooks/usePoiLocalization.ts
hooks/useAudioPlayback.ts
hooks/useTourNavigation.ts

// ❌ WRONG: Hooks scattered or too generic
utils/useLocalization.ts
services/hooks/useAudio.ts
context/audioHook.ts
```

**Rule**: Centralize in `hooks/`, clear naming with use prefix.

---

## 📝 Naming Conventions

### Services

```typescript
// ✅ CORRECT: Domain.service.ts
poi.service.ts              // Public service
admin/poi.service.ts        // Admin-specific service
shop-owner/analytics.service.ts

// ❌ WRONG
poiService.ts               // Should be poi.service.ts
poi-api.ts
poiDataService.ts           // Too generic
```

### Components

```typescript
// ✅ CORRECT: PascalCase, descriptive
PoiCard.tsx
POIImageCarousel.tsx
LocalizationPanel.tsx
ConflictModal.tsx

// ❌ WRONG
poiCard.tsx                 // Should be PascalCase
Poi_card.tsx
POIcard.tsx (inconsistent casing)
Card_POI_Comp.tsx           // Too generic + unclear
```

### Hooks

```typescript
// ✅ CORRECT: useXyz pattern
usePoiLocalization.ts
useAudioPlayer.ts
useSupportedLanguages.ts
useLocalizedText.ts

// ❌ WRONG
PoiLocalization.ts          // Should have 'use' prefix
localizeHook.ts
audio-player-hook.ts        # Should be camelCase + use prefix
```

### Types/Interfaces

```typescript
// ✅ CORRECT: PascalCase for types
types/Poi.ts
types/POI.ts (acronym uppercase)
types/AudioTrack.ts
types/LocalizedText.ts

// ❌ WRONG
types/poi.ts                # Should be PascalCase
types/poi-interface.ts
interfaces/POI.ts           # Should be in types/ unless large
```

### Tests

```typescript
// ✅ CORRECT: [name].test.ts or [name].spec.ts
poi.service.test.ts
usePoiLocalization.test.ts
POICard.test.tsx

// ❌ WRONG
poi-test.ts
test-poi.ts
poi.spec.ts (inconsistent with .test.ts)
poi_test.ts
```

---

## 🔌 Import Patterns

### Barrel Exports

```typescript
// ✅ CORRECT: Barrel export in each folder
services/api/index.ts:
export * from './public.service';
export * from './tourist.service';
export * from './auth.service';

// Usage:
import { publicService } from '@/services/api';

// ❌ WRONG: Deep imports
import publicService from '@/services/api/public.service';
```

### Path Aliases

```typescript
// tsconfig.json or vitest.config.ts
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/hooks/*": ["src/hooks/*"]
    }
  }
}

// ✅ CORRECT: Use aliases
import { POICard } from '@/components/poi/POICard';
import { usePoiLocalization } from '@/hooks/usePoiLocalization';

// ❌ WRONG: Relative imports
import { POICard } from '../../../components/poi/POICard';
import { usePoiLocalization } from '../../hooks/usePoiLocalization';
```

### Organize Imports

Use this order (consistent with ESLint rules):

```typescript
// 1. External packages
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 2. Shared types/utils
import type { POI } from '@/types';
import { formatDate } from '@/utils';

// 3. Services
import { poiService } from '@/services/api/admin';

// 4. Hooks
import { usePoiLocalization } from '@/hooks';

// 5. Components
import { POICard } from '@/components/shared';

// 6. Local/relative imports
import { localHelper } from './helpers';

// 7. Styles
import styles from './POIList.module.css';
```

---

## 🧬 Code Organization Patterns

### Service File Structure

```typescript
// ✅ CORRECT
export class PoiService {
  // 1. Constructor & dependencies
  constructor(private api: ApiClient) {}

  // 2. Main public methods (CRUD)
  async create(dto: CreatePoiDto): Promise<POI> { ... }
  async findAll(query: QueryPoiDto): Promise<POI[]> { ... }
  async findOne(id: string): Promise<POI> { ... }
  async update(id: string, dto: UpdatePoiDto): Promise<POI> { ... }
  async delete(id: string): Promise<void> { ... }

  // 3. Private helper methods
  private validatePoiData(data: unknown) { ... }
  private transformPoiResponse(raw: RawPOI): POI { ... }
}
```

### Component File Structure

```typescript
// ✅ CORRECT
import React, { useState, useEffect } from 'react';
import type { ComponentProps } from './types';
import { usePoiLocalization } from '@/hooks';
import { PoiCard } from './PoiCard';
import styles from './POIList.module.css';

interface Props {
  pois: POI[];
  onSelect?: (poi: POI) => void;
}

export const POIList: React.FC<Props> = ({ pois, onSelect }) => {
  // 1. Hooks
  const { translate } = usePoiLocalization();
  
  // 2. State
  const [selected, setSelected] = useState<string | null>(null);
  
  // 3. Effects
  useEffect(() => { ... }, []);
  
  // 4. Event handlers
  const handleSelect = (poi: POI) => { ... };
  
  // 5. Render
  return (
    <div className={styles.list}>
      {pois.map(poi => (
        <PoiCard key={poi.id} poi={poi} onClick={handleSelect} />
      ))}
    </div>
  );
};

export default POIList;
```

### Hook File Structure

```typescript
// ✅ CORRECT
import { useEffect, useRef, useState } from 'react';
import { audioService } from '@/services';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  play: (url: string) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  // 1. State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 2. Main logic
  const play = async (url: string) => { ... };
  const pause = async () => { ... };
  const stop = async () => { ... };
  
  // 3. Effects & cleanup
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);
  
  // 4. Return
  return { isPlaying, play, pause, stop };
}
```

---

## 📦 Shared Package (`packages/localization-shared`)

### Export Organization

```typescript
// src/index.ts (Main barrel)
export * from './types';
export * from './enums';
export * from './utils';
export * from './react';

// src/react/index.ts (React-specific)
export * from './usePoiLocalizations';
export * from './useLocalizedText';

// src/react-native/index.ts (React Native-specific)
export * from './usePoiLocalizations';
export * from './useAudioFallback';

// Usage in Admin (React):
import { usePoiLocalizations } from '@localization-shared/react';

// Usage in Mobile (React Native):
import { usePoiLocalizations } from '@localization-shared/react-native';
```

---

## ✅ Checklist Before Committing

- [ ] All files follow naming conventions
- [ ] Imports organized correctly (external → local)
- [ ] Barrel exports used where applicable
- [ ] No deep relative imports (`../../../components/`)
- [ ] TypeScript types properly organized
- [ ] Tests co-located with source (`*.test.ts`)
- [ ] No unused imports
- [ ] Max 400 lines per file (services) / 300 lines (components)
- [ ] Functions have JSDoc comments
- [ ] Error handling included

---

## 🚫 Common Anti-Patterns (Avoid)

| Anti-Pattern | Why Bad | Solution |
|--------------|---------|----------|
| **Flat folder structure** | Hard to navigate, no scaling | Use domain-based folders |
| **Mega services (1000+ lines)** | Hard to test, unclear responsibility | Split by domain/role |
| **Deep relative imports** | Brittle paths, hard to refactor | Use path aliases |
| **Mixed concerns** | Hard to test, reuse logic | Separate business logic & UI |
| **No types** | Runtime errors, less maintainable | Use TypeScript strictly |
| **Unused exports** | Unclear what's public API | Delete unused, use barrel exports |
| **Inconsistent naming** | Confusing for team | Follow conventions strictly |

---

## 🔄 Review Checklist

Before merging PRs in new structure, reviewer should check:

- [ ] Files in correct folders per new structure
- [ ] Naming conventions followed
- [ ] Imports using path aliases
- [ ] No circular dependencies
- [ ] Tests pass
- [ ] Types properly typed (no `any`)
- [ ] Components/services under 400 lines
- [ ] Barrel exports work
- [ ] No dead code

