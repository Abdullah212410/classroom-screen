
export interface BackgroundImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  tags: string[];
  mediaType?: 'image' | 'video';
}

export interface BackgroundCategory {
  id: string;
  title: string;
  images: BackgroundImage[];
}

// Helper to generate Unsplash URLs
const unsplash = (id: string, w = 1920) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const thumb = (id: string) => unsplash(id, 400);

export const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  {
    id: 'motion',
    title: 'Motion (Video)',
    images: [
      { id: 'vid1', url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4', thumbnail: unsplash('1441974231531-c6227db76b6e', 400), title: 'Forest Stream', tags: ['nature', 'video', 'water'], mediaType: 'video' },
      { id: 'vid2', url: 'https://assets.mixkit.co/videos/preview/mixkit-white-abstract-bokeh-lights-22955-large.mp4', thumbnail: unsplash('1510989019312-c2153628ad8b', 400), title: 'White Bokeh', tags: ['abstract', 'video', 'light'], mediaType: 'video' },
      { id: 'vid3', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4', thumbnail: unsplash('1451187580459-43490279c0fa', 400), title: 'Space Stars', tags: ['space', 'video'], mediaType: 'video' },
      { id: 'vid4', url: 'https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-1863-large.mp4', thumbnail: unsplash('1550684848-fac1c5b4e853', 400), title: 'Ink Swirl', tags: ['abstract', 'video', 'ink'], mediaType: 'video' },
      { id: 'vid5', url: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4', thumbnail: unsplash('1444703686981-a3abbc4d4fe3', 400), title: 'Blue Sky', tags: ['sky', 'video', 'clouds'], mediaType: 'video' },
      { id: 'vid6', url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4', thumbnail: unsplash('1507525428034-b723cf961d3e', 400), title: 'Ocean Waves', tags: ['ocean', 'water', 'waves'], mediaType: 'video' },
      { id: 'vid7', url: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-window-sill-1473-large.mp4', thumbnail: unsplash('1515694346937-94d85e41e6f0', 400), title: 'Rainy Window', tags: ['rain', 'cozy', 'weather'], mediaType: 'video' },
      { id: 'vid8', url: 'https://assets.mixkit.co/videos/preview/mixkit-campfire-burning-at-night-2503-large.mp4', thumbnail: unsplash('1525209149971-5c4d811eef20', 400), title: 'Campfire', tags: ['fire', 'night', 'camping'], mediaType: 'video' },
      { id: 'vid9', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-blue-lights-in-darkness-2396-large.mp4', thumbnail: unsplash('1550684848-fac1c5b4e853', 400), title: 'Blue Neon', tags: ['abstract', 'lights', 'neon'], mediaType: 'video' }
    ]
  },
  {
    id: 'winter',
    title: 'Winter',
    images: [
      { id: 'win1', url: unsplash('1483664852095-d6cc68707056'), thumbnail: thumb('1483664852095-d6cc68707056'), title: 'Snowy Tree', tags: ['snow', 'winter', 'cold'] },
      { id: 'win2', url: unsplash('1518173946687-a4c8892bbd9f'), thumbnail: thumb('1518173946687-a4c8892bbd9f'), title: 'Winter Forest', tags: ['forest', 'snow', 'nature'] },
      { id: 'win3', url: unsplash('1457269449834-928af6406ed3'), thumbnail: thumb('1457269449834-928af6406ed3'), title: 'Frosty Morning', tags: ['frost', 'ice', 'winter'] },
      { id: 'win4', url: unsplash('1491002052546-bf38f186af56'), thumbnail: thumb('1491002052546-bf38f186af56'), title: 'Snow Mountain', tags: ['mountain', 'snow', 'winter'] },
      { id: 'win5', url: unsplash('1548266652-99cf277df5c8'), thumbnail: thumb('1548266652-99cf277df5c8'), title: 'Fox in Snow', tags: ['animal', 'fox', 'winter'] },
      { id: 'win6', url: unsplash('1516466723877-e462d73002e9'), thumbnail: thumb('1516466723877-e462d73002e9'), title: 'Cozy Cabin', tags: ['cabin', 'warm', 'winter'] },
      { id: 'win7', url: unsplash('1478265409131-1f65c88f965c'), thumbnail: thumb('1478265409131-1f65c88f965c'), title: 'Winter Walk', tags: ['walk', 'winter', 'path'] },
    ]
  },
  {
    id: 'valentine',
    title: "Valentine's Day",
    images: [
      { id: 'val1', url: unsplash('1518199266791-5375a83190b7'), thumbnail: thumb('1518199266791-5375a83190b7'), title: 'Heart Bokeh', tags: ['love', 'heart', 'pink'] },
      { id: 'val2', url: unsplash('1549417229-aaab48552c24'), thumbnail: thumb('1549417229-aaab48552c24'), title: 'Pink Roses', tags: ['flowers', 'roses', 'love'] },
      { id: 'val3', url: unsplash('1512413914633-b5043f4041ea'), thumbnail: thumb('1512413914633-b5043f4041ea'), title: 'Paper Hearts', tags: ['craft', 'heart', 'red'] },
      { id: 'val4', url: unsplash('1469334031218-e382a71b716b'), thumbnail: thumb('1469334031218-e382a71b716b'), title: 'Love Lights', tags: ['lights', 'warm', 'love'] },
      { id: 'val5', url: unsplash('1551024641-b9632317785c'), thumbnail: thumb('1551024641-b9632317785c'), title: 'Candy Hearts', tags: ['candy', 'sweet', 'valentine'] },
    ]
  },
  {
    id: 'nature',
    title: 'Nature',
    images: [
      { id: 'nat1', url: unsplash('1501854140884-074cf2b2c75d'), thumbnail: thumb('1501854140884-074cf2b2c75d'), title: 'Misty Forest', tags: ['forest', 'green', 'mist'] },
      { id: 'nat2', url: unsplash('1472214103451-9374bd1c798e'), thumbnail: thumb('1472214103451-9374bd1c798e'), title: 'Green Hills', tags: ['hills', 'nature', 'landscape'] },
      { id: 'nat3', url: unsplash('1441974231531-c6227db76b6e'), thumbnail: thumb('1441974231531-c6227db76b6e'), title: 'Sunlight Woods', tags: ['woods', 'sun', 'trees'] },
      { id: 'nat4', url: unsplash('1470071459604-3b5ec3a7fe05'), thumbnail: thumb('1470071459604-3b5ec3a7fe05'), title: 'Foggy Mountains', tags: ['fog', 'mountains', 'nature'] },
      { id: 'nat5', url: unsplash('1465146344425-f00d5f5c8f07'), thumbnail: thumb('1465146344425-f00d5f5c8f07'), title: 'Deep Ocean', tags: ['ocean', 'water', 'blue'] },
      { id: 'nat6', url: unsplash('1464822759023-fed622ff2c3b'), thumbnail: thumb('1464822759023-fed622ff2c3b'), title: 'Mountain Lake', tags: ['lake', 'mountain', 'nature'] },
      { id: 'nat7', url: unsplash('1508247072-8d7b38d3886f'), thumbnail: thumb('1508247072-8d7b38d3886f'), title: 'Autumn Road', tags: ['autumn', 'road', 'orange'] },
      { id: 'nat8', url: unsplash('1509316975850-ff9c5deb0cd9'), thumbnail: thumb('1509316975850-ff9c5deb0cd9'), title: 'Desert Dunes', tags: ['desert', 'sand', 'warm'] },
      { id: 'nat9', url: unsplash('1432405972618-c603610ca94f'), thumbnail: thumb('1432405972618-c603610ca94f'), title: 'Waterfall', tags: ['water', 'nature', 'falls'] },
    ]
  },
  {
    id: 'classroom',
    title: 'Classroom & Study',
    images: [
      { id: 'cls1', url: unsplash('1503676260728-1c00da094a0b'), thumbnail: thumb('1503676260728-1c00da094a0b'), title: 'Pencils', tags: ['school', 'pencils', 'colorful'] },
      { id: 'cls2', url: unsplash('1456513080510-7bf3a84b82f8'), thumbnail: thumb('1456513080510-7bf3a84b82f8'), title: 'Library Books', tags: ['books', 'library', 'study'] },
      { id: 'cls3', url: unsplash('1509062522246-3755977927d7'), thumbnail: thumb('1509062522246-3755977927d7'), title: 'Chalkboard', tags: ['chalkboard', 'school', 'texture'] },
      { id: 'cls4', url: unsplash('1497633762265-9d179a990aa6'), thumbnail: thumb('1497633762265-9d179a990aa6'), title: 'Open Book', tags: ['book', 'reading', 'learn'] },
      { id: 'cls5', url: unsplash('1523050854058-8df90110c9f1'), thumbnail: thumb('1523050854058-8df90110c9f1'), title: 'Graduation', tags: ['graduation', 'school', 'success'] },
      { id: 'cls6', url: unsplash('1513364776144-60967b0f800f'), thumbnail: thumb('1513364776144-60967b0f800f'), title: 'Art Supplies', tags: ['art', 'paint', 'creative'] },
      { id: 'cls7', url: unsplash('1521295462409-b1d8d5a88da2'), thumbnail: thumb('1521295462409-b1d8d5a88da2'), title: 'World Globe', tags: ['globe', 'geography', 'learn'] },
    ]
  },
  {
    id: 'space',
    title: 'Space',
    images: [
      { id: 'spc1', url: unsplash('1451187580459-43490279c0fa'), thumbnail: thumb('1451187580459-43490279c0fa'), title: 'Deep Space', tags: ['space', 'stars', 'galaxy'] },
      { id: 'spc2', url: unsplash('1446776811953-d23dc521b681'), thumbnail: thumb('1446776811953-d23dc521b681'), title: 'Nebula', tags: ['nebula', 'colors', 'space'] },
      { id: 'spc3', url: unsplash('1444703686981-a3abbc4d4fe3'), thumbnail: thumb('1444703686981-a3abbc4d4fe3'), title: 'Night Sky', tags: ['night', 'stars', 'sky'] },
      { id: 'spc4', url: unsplash('1538370967913-478d84d29712'), thumbnail: thumb('1538370967913-478d84d29712'), title: 'Moon', tags: ['moon', 'space', 'dark'] },
    ]
  },
  {
    id: 'minimal',
    title: 'Minimal & Patterns',
    images: [
      { id: 'min1', url: unsplash('1507525428034-b723cf961d3e'), thumbnail: thumb('1507525428034-b723cf961d3e'), title: 'Ocean Surface', tags: ['water', 'texture', 'blue'] },
      { id: 'min2', url: unsplash('1494438639946-1ebd1d20bf85'), thumbnail: thumb('1494438639946-1ebd1d20bf85'), title: 'White Texture', tags: ['white', 'simple', 'clean'] },
      { id: 'min3', url: unsplash('1550684848-fac1c5b4e853'), thumbnail: thumb('1550684848-fac1c5b4e853'), title: 'Abstract Gradient', tags: ['gradient', 'color', 'abstract'] },
      { id: 'min4', url: unsplash('1510989019312-c2153628ad8b'), thumbnail: thumb('1510989019312-c2153628ad8b'), title: 'Geometric', tags: ['shapes', 'geometric', 'dark'] },
      { id: 'min5', url: unsplash('1619961314352-52e70c06a31f'), thumbnail: thumb('1619961314352-52e70c06a31f'), title: 'Dark Marble', tags: ['marble', 'dark', 'stone'] },
      { id: 'min6', url: unsplash('1557683311-60a34f713652'), thumbnail: thumb('1557683311-60a34f713652'), title: 'Soft Gradient', tags: ['gradient', 'pastel', 'pink'] },
    ]
  }
];
