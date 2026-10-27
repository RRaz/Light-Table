
export interface Photo {
  id: string;
  url: string;
  title: string;
}

export interface AppState {
  photos: Photo[];
  selectedIds: Set<string>;
  activeIndex: number;
  isSlideshowActive: boolean;
}
