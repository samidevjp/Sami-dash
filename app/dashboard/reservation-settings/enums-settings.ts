// enums-settings.ts

export const DAYS_OF_WEEK_MAP: { [key: number]: string } = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
};

export const BUTTON_SHAPES = [
  { label: 'Circle', value: 1 },
  { label: 'Square', value: 2 },
  { label: 'Rounded', value: 3 }
];
export const BUTTON_SHAPE_CLASSES: { [key: number]: string } = {
  1: 'rounded-full', // 1 → Circle
  2: 'rounded-none', // 2 → Square
  3: 'rounded-lg' // 3 → Rounded
};

export const MV_TYPE: any = {
  FullImage: 1,
  Cropped: 2
};
