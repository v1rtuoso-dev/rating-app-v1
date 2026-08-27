export type Flight = {
  id: number;
  flightNo: string;
  route: string;
  flightDate: string;
  flightTime: string;
  status: string;
};

export type Reason = {
  id: number;
  label: string;
};

export type Evaluation = {
  id: number;
  flightNo: string;
  counter: string;
  rating: number;
  createdAt: string;
};

export const mockFlights: Flight[] = [
  {
    id: 101,
    flightNo: 'VN210',
    route: 'SGN → HAN',
    flightDate: '2026-07-28',
    flightTime: '08:30',
    status: 'On time',
  },
  {
    id: 102,
    flightNo: 'VN512',
    route: 'HAN → SGN',
    flightDate: '2026-07-28',
    flightTime: '11:20',
    status: 'Boarding',
  },
  {
    id: 103,
    flightNo: 'QF88',
    route: 'SGN → BKK',
    flightDate: '2026-07-28',
    flightTime: '15:45',
    status: 'Delayed',
  },
];

export const mockReasons: Reason[] = [
  { id: 1, label: 'Thời gian chờ lâu / Queue too long' },
  { id: 2, label: 'Thái độ nhân viên / Staff not helpful' },
  { id: 3, label: 'Quy trình chưa rõ ràng / Process unclear' },
  { id: 4, label: 'Sự cố thiết bị / Equipment issue' },
  { id: 5, label: 'Rào cản ngôn ngữ / Language barrier' },
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 1,
    flightNo: 'VN210',
    counter: 'Counter A',
    rating: 4,
    createdAt: '08:10',
  },
  {
    id: 2,
    flightNo: 'VN512',
    counter: 'Counter C',
    rating: 2,
    createdAt: '10:35',
  },
  {
    id: 3,
    flightNo: 'QF88',
    counter: 'Counter B',
    rating: 3,
    createdAt: '14:20',
  },
];

export function getSummaryStats() {
  const total = mockEvaluations.length;
  const excellent = mockEvaluations.filter((item) => item.rating >= 4).length;
  const average = Math.round((mockEvaluations.reduce((sum, item) => sum + item.rating, 0) / total) * 10) / 10;

  return {
    total,
    excellent,
    average,
  };
}
