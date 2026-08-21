export interface MockProduct {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  threshold: number;
  description: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: "1",
    name: "유기농 원두 커피 1kg",
    price: 24000,
    stockQuantity: 42,
    threshold: 10,
    description:
      "직접 로스팅한 유기농 원두를 1kg 단위로 packaging했습니다. 산미가 적고 고소한 맛이 특징입니다.",
  },
  {
    id: "2",
    name: "핸드드립 드리퍼 세트",
    price: 18500,
    stockQuantity: 27,
    threshold: 8,
    description:
      "초보자도 쉽게 사용할 수 있는 핸드드립 드리퍼와 서버 세트입니다.",
  },
  {
    id: "3",
    name: "무선 이어폰 프로",
    price: 89000,
    stockQuantity: 9,
    threshold: 8,
    description:
      "노이즈 캔슬링 기능이 탑재된 무선 이어폰입니다. 최대 24시간 연속 재생이 가능합니다.",
  },
  {
    id: "4",
    name: "스테인리스 텀블러 500ml",
    price: 15000,
    stockQuantity: 5,
    threshold: 10,
    description: "보온/보냉 기능을 갖춘 500ml 용량의 스테인리스 텀블러입니다.",
  },
  {
    id: "5",
    name: "천연 소이 캔들",
    price: 12000,
    stockQuantity: 0,
    threshold: 5,
    description: "천연 소이 왁스로 만든 향초로, 은은한 라벤더 향이 특징입니다.",
  },
  {
    id: "6",
    name: "가죽 노트 커버 A5",
    price: 32000,
    stockQuantity: 60,
    threshold: 15,
    description: "천연 가죽으로 제작된 A5 사이즈 노트 커버입니다.",
  },
  {
    id: "7",
    name: "미니 가습기",
    price: 27500,
    stockQuantity: 3,
    threshold: 6,
    description: "책상 위에 두기 좋은 소형 초음파 가습기입니다.",
  },
  {
    id: "8",
    name: "면 100% 에코백",
    price: 9000,
    stockQuantity: 0,
    threshold: 20,
    description: "튼튼한 면 소재로 제작된 대용량 에코백입니다.",
  },
];
