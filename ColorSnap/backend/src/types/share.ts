import type { PaletteColor, Season } from './analysis';

export type SavedResultRecord = {
  saved_result_id: string;
  analysis_id: string;
  title: string;
  primary_season: Season;
  secondary_season: Season | null;
  confidence?: number;
  palette: PaletteColor[];
  summary: string;
  include_photo: boolean;
  created_at: string;
};

export type ShareRecord = {
  share_id: string;
  analysis_id: string;
  saved_result_id?: string;
  visibility: 'unlisted';
  title: string;
  description: string;
  primary_season: Season;
  secondary_season: Season | null;
  palette: Array<{
    name: string;
    hex: string;
  }>;
  include_photo: boolean;
  image_url: string | null;
  share_url: string;
  created_at: string;
};
