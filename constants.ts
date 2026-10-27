import { Photo } from './types';

/**
 * Replace these URLs with your own high-resolution image links.
 * Ensure your server handles CORS (Cross-Origin Resource Sharing) if you want the magnifier feature to work.
 * To enable CORS, your server response should include: Access-Control-Allow-Origin: *
 */
export const GALLERY_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2670',
    title: 'Alpine Vista',
    format: 'High-Res',
    resolution: '8K',
    date: '2024-05-08'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2670',
    title: 'Serene Lake',
    format: 'High-Res',
    resolution: '8K',
    date: '2024-05-08'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560',
    title: 'Morning Forest',
    format: 'High-Res',
    resolution: '4K',
    date: '2024-05-08'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2670',
    title: 'Coastal Sunset',
    format: 'High-Res',
    resolution: '8K',
    date: '2024-05-08'
  }
];
