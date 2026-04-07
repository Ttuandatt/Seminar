import { Injectable } from '@nestjs/common';
import { Tour, Poi, TourPoi } from '@prisma/client';

export interface TourGenerationContext {
  tourName: string;
  tourDescription?: string | null;
  totalDistance: number;
  estimatedDuration: number;
  poiCount: number;
  categoryBreakdown: Record<string, number>;
  pois: Array<{
    id: string;
    name: string;
    category: string;
    description?: string | null;
    distanceFromPrev: number;
    walkTimeFromPrev: number;
    orderIndex: number;
  }>;
}

@Injectable()
export class NarrationGenerator {
  
  generateIntro(ctx: TourGenerationContext, lang: 'VI' | 'EN'): string {
    const categoryList = Object.keys(ctx.categoryBreakdown).join(', '); // Simplified
    
    if (lang === 'VI') {
      return `Chào mừng bạn đến với ${ctx.tourName}! ${ctx.tourDescription || ''}. Tour gồm ${ctx.poiCount} điểm dừng, trải dài khoảng ${ctx.totalDistance} mét, dự kiến ${ctx.estimatedDuration} phút đi bộ. Bạn sẽ khám phá ${categoryList}. Hãy bắt đầu hành trình nào!`;
    }
    
    return `Welcome to ${ctx.tourName}! ${ctx.tourDescription || ''}. This tour has ${ctx.poiCount} stops, covering approximately ${ctx.totalDistance} meters, estimated ${ctx.estimatedDuration} minutes on foot. You'll explore ${categoryList}. Let's begin!`;
  }

  generateTransition(nextPoiName: string, distance: number, walkTime: number, category: string, description: string | null, lang: 'VI' | 'EN'): string {
    let categoryHintVi = description ? description.substring(0, 100) + '...' : '';
    let categoryHintEn = description ? description.substring(0, 100) + '...' : '';
    
    switch(category) {
      case 'DINING':
        categoryHintVi = 'Đây là một quán ăn nổi tiếng trong khu vực.';
        categoryHintEn = 'This is a famous dining spot in the area.';
        break;
      case 'STREET_FOOD':
        categoryHintVi = 'Một điểm ẩm thực đường phố không thể bỏ qua.';
        categoryHintEn = 'A must-visit street food destination.';
        break;
    }

    if (lang === 'VI') {
      return `Tuyệt vời! Tiếp theo chúng ta sẽ đến ${nextPoiName}, cách đây khoảng ${distance} mét, đi bộ khoảng ${walkTime} phút. ${categoryHintVi}`;
    }
    
    return `Wonderful! Next we'll head to ${nextPoiName}, about ${distance} meters away, roughly ${walkTime} minutes on foot. ${categoryHintEn}`;
  }

  generateArrival(poiName: string, stopNumber: number, lang: 'VI' | 'EN'): string {
    if (lang === 'VI') {
      return `Chúng ta đã đến ${poiName}! Đây là điểm dừng thứ ${stopNumber} trong hành trình. Hãy cùng lắng nghe câu chuyện về nơi này.`;
    }
    return `We've arrived at ${poiName}! This is stop ${stopNumber} on our journey. Let's hear the story of this place.`;
  }

  generateOutro(ctx: TourGenerationContext, lang: 'VI' | 'EN'): string {
    if (lang === 'VI') {
      return `Chúc mừng! Bạn đã hoàn thành ${ctx.tourName}. Hôm nay chúng ta đã ghé thăm ${ctx.poiCount} địa điểm và đi qua khoảng ${ctx.totalDistance} mét. Cảm ơn bạn đã đồng hành, hẹn gặp lại ở chuyến tham quan tiếp theo!`;
    }
    return `Congratulations! You've completed ${ctx.tourName}. Today we visited ${ctx.poiCount} locations covering about ${ctx.totalDistance} meters. Thank you for joining, see you on the next adventure!`;
  }
}
