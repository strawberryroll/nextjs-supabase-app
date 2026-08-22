export interface MockProduct {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  threshold: number;
  description: string;
  imageUrl: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: "1",
    name: "에티오피아 예가체프 (라이트 로스팅)",
    price: 24000,
    stockQuantity: 42,
    threshold: 10,
    description:
      "은은한 산미와 꽃향이 특징인 예가체프 원두를 라이트 로스팅으로 볶았습니다. 핸드드립에 가장 잘 어울립니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1612487458970-564127ec86f5?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "2",
    name: "콜롬비아 수프리모 (미디엄 로스팅)",
    price: 22000,
    stockQuantity: 27,
    threshold: 8,
    description:
      "균형 잡힌 산미와 진한 바디감을 가진 콜롬비아 수프리모 원두입니다. 에스프레소와 드립 모두에 잘 어울립니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "3",
    name: "과테말라 안티구아 (다크 로스팅)",
    price: 26000,
    stockQuantity: 9,
    threshold: 8,
    description:
      "묵직한 바디감과 초콜릿 풍미가 특징인 과테말라 안티구아 원두를 다크 로스팅으로 볶았습니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1625021659159-f63f546d74a7?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "4",
    name: "핸드드립 드리퍼 세트",
    price: 18500,
    stockQuantity: 5,
    threshold: 10,
    description:
      "초보자도 쉽게 사용할 수 있는 핸드드립 드리퍼와 서버 세트입니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1534516484460-0b6099615d5a?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "5",
    name: "세라믹 드립 서버 500ml",
    price: 21000,
    stockQuantity: 0,
    threshold: 5,
    description:
      "추출한 커피를 담아내는 500ml 용량의 세라믹 드립 서버입니다. 눈금 표시로 추출량 확인이 편리합니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1618666185548-01f65f111766?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "6",
    name: "핸드밀 원두 그라인더",
    price: 32000,
    stockQuantity: 60,
    threshold: 15,
    description:
      "세라믹 절삭날을 탑재한 수동 핸드밀입니다. 균일한 분쇄도로 원두 본연의 향을 살려줍니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1646346834998-5b610ec21d12?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "7",
    name: "드립 전용 거위목 케틀",
    price: 27500,
    stockQuantity: 3,
    threshold: 6,
    description:
      "물줄기를 세밀하게 조절할 수 있는 거위목(goose-neck) 디자인의 드립 전용 케틀입니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1592417766326-088bf3da80c5?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
  {
    id: "8",
    name: "원두 보관용 밀폐 캐니스터",
    price: 15000,
    stockQuantity: 0,
    threshold: 20,
    description:
      "원웨이 밸브가 장착되어 원두의 신선도를 오래 유지해주는 밀폐형 보관 캐니스터입니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1596158231147-3fb45e9bcee9?w=600&h=600&fit=crop&fm=jpg&q=80",
  },
];
