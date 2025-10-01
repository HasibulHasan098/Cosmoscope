import type { NasaPhoto } from '../types';
import { NASA_API_KEY, NASA_API_URL } from '../constants';

export async function fetchMarsPhotos(sol: number, page: number = 1): Promise<NasaPhoto[]> {
  const url = `${NASA_API_URL}?sol=${sol}&api_key=${NASA_API_KEY}&page=${page}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch photos from NASA API');
  }
  const data = await response.json();
  return data.photos;
}
