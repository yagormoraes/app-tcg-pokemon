export interface Card {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  hp?: string;
  attacks?: Array<{
    name: string;
    damage: string;
    text?: string;
  }>;
  set?: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    ptcgoCode?: string;
    releaseDate: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      normal?: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
    };
  };
}
