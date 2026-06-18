export const SCALE = 0.08; // default px per mm

export const FURNITURE_CATEGORIES = [
  {
    name: 'Living Room',
    items: [
      { type: 'sofa-3', name: 'Sofa (3-seater)', w: 2100, h: 900, color: '#7BAFD4' },
      { type: 'sofa-2', name: 'Sofa (2-seater)', w: 1600, h: 850, color: '#7BAFD4' },
      { type: 'l-sofa', name: 'L-Sofa', w: 2600, h: 1600, color: '#5B9FD4' },
      { type: 'armchair', name: 'Armchair', w: 850, h: 850, color: '#7BAFD4' },
      { type: 'coffee-table', name: 'Coffee Table', w: 1200, h: 600, color: '#C8A865' },
      { type: 'side-table', name: 'Side Table', w: 600, h: 600, color: '#C8A865' },
      { type: 'tv-console', name: 'TV Console', w: 1800, h: 450, color: '#8B7355' },
      { type: 'tv-55', name: 'TV (55")', w: 1300, h: 80, color: '#333' },
      { type: 'tv-65', name: 'TV (65")', w: 1550, h: 80, color: '#333' },
    ],
  },
  {
    name: 'Dining',
    items: [
      { type: 'dining-4', name: 'Dining Table (4)', w: 1200, h: 800, color: '#5BA041' },
      { type: 'dining-6', name: 'Dining Table (6)', w: 1600, h: 900, color: '#5BA041' },
      { type: 'dining-8', name: 'Dining Table (8)', w: 2400, h: 1000, color: '#5BA041' },
      { type: 'dining-4-round', name: 'Round Table (4)', w: 1000, h: 1000, color: '#5BA041', shape: 'ellipse' },
      { type: 'dining-6-round', name: 'Round Table (6)', w: 1300, h: 1300, color: '#5BA041', shape: 'ellipse' },
      { type: 'dining-chair', name: 'Chair', w: 450, h: 450, color: '#A9DFBF' },
    ],
  },
  {
    name: 'Bedroom',
    items: [
      { type: 'king-bed', name: 'King Bed', w: 1930, h: 2030, color: '#9B59B6' },
      { type: 'queen-bed', name: 'Queen Bed', w: 1530, h: 2030, color: '#9B59B6' },
      { type: 'super-single', name: 'Super Single', w: 1070, h: 2030, color: '#9B59B6' },
      { type: 'single-bed', name: 'Single Bed', w: 920, h: 2030, color: '#9B59B6' },
      { type: 'wardrobe-xl', name: 'Wardrobe XL', w: 2400, h: 600, color: '#7D6608' },
      { type: 'wardrobe-lg', name: 'Wardrobe L', w: 1800, h: 600, color: '#7D6608' },
      { type: 'wardrobe-md', name: 'Wardrobe M', w: 1200, h: 600, color: '#8B7355' },
      { type: 'wardrobe-sm', name: 'Wardrobe S', w: 900, h: 600, color: '#8B7355' },
      { type: 'bedside', name: 'Bedside Table', w: 500, h: 500, color: '#D4AC0D' },
      { type: 'dresser', name: 'Dresser', w: 1200, h: 450, color: '#7D6608' },
      { type: 'desk', name: 'Study Desk', w: 1200, h: 600, color: '#D4AC0D' },
      { type: 'study-chair', name: 'Study Chair', w: 600, h: 600, color: '#F0B27A' },
    ],
  },
  {
    name: 'Kitchen',
    items: [
      { type: 'fridge-lg', name: 'Fridge (Large)', w: 900, h: 700, color: '#85C1E9' },
      { type: 'fridge-sm', name: 'Fridge (Small)', w: 600, h: 600, color: '#85C1E9' },
      { type: 'stove', name: 'Stove / Hob', w: 700, h: 600, color: '#E74C3C' },
      { type: 'oven', name: 'Oven', w: 600, h: 600, color: '#E67E22' },
      { type: 'microwave', name: 'Microwave', w: 500, h: 350, color: '#95A5A6' },
      { type: 'washing-machine', name: 'Washer', w: 600, h: 600, color: '#85C1E9' },
      { type: 'dryer', name: 'Dryer', w: 600, h: 600, color: '#85C1E9' },
      { type: 'kitchen-counter', name: 'Kitchen Counter', w: 1500, h: 600, color: '#F0E68C' },
      { type: 'island', name: 'Kitchen Island', w: 1200, h: 900, color: '#F0E68C' },
    ],
  },
  {
    name: 'Bathroom',
    items: [
      { type: 'toilet', name: 'Toilet', w: 380, h: 680, color: '#AED6F1' },
      { type: 'sink', name: 'Wash Basin', w: 500, h: 430, color: '#AED6F1' },
      { type: 'shower', name: 'Shower Stall', w: 900, h: 900, color: '#AED6F1' },
      { type: 'bathtub', name: 'Bathtub', w: 1700, h: 800, color: '#AED6F1' },
      { type: 'vanity', name: 'Vanity Unit', w: 1200, h: 500, color: '#AED6F1' },
    ],
  },
  {
    name: 'Storage',
    items: [
      { type: 'bookshelf', name: 'Bookshelf', w: 800, h: 300, color: '#D7DBDD' },
      { type: 'shoe-cabinet', name: 'Shoe Cabinet', w: 900, h: 350, color: '#D7DBDD' },
      { type: 'storage-unit', name: 'Storage Unit', w: 900, h: 450, color: '#BDC3C7' },
    ],
  },
];

export const ALL_FURNITURE = FURNITURE_CATEGORIES.flatMap(c => c.items);
