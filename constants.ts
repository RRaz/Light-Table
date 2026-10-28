import { Photo } from './types';

/**
 * Sample photos kept for local experiments. The viewer itself loads its list
 * from the gallery's gallery.json, so nothing here is used at run time.
 */
export const GALLERY_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2670',
    title: 'Alpine Vista',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2670',
    title: 'Serene Lake',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560',
    title: 'Morning Forest',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2670',
    title: 'Coastal Sunset',
  }
];
