export type RankKind = "score" | "fresh" | "hot";

export interface RankedProduct {
  rank: number;
  id: number;
  logo: string;
  name: string;
  summary: string;
  score: string;
  starRating: number;
  logoTone: number;
}

export interface RankList {
  items: RankedProduct[];
  startTime: number;
  endTime: number;
}

export interface RankData {
  score: RankList;
  fresh: RankList;
  hot: RankList;
  sourceUrl: string;
  updatedAt: string;
  isFallback: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  summary: string;
  companyName: string | null;
  employeeCount: string | null;
  financingState: string | null;
  companyAddress: string | null;
  foundingDate: string | null;
  officialWebsite: string | null;
  images: string[];
  tags: string[];
  score: string;
  logo: string;
  noteCount: number;
  reviewCount: number;
  introduction: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ProductReview {
  id: number;
  userName: string;
  userLogo: string;
  content: string;
  score: string;
  publishTime: number;
  images: string[];
}

export interface ProductNote {
  id: number;
  title: string;
  userName: string;
  userLogo: string;
  publishTime: number;
  image: string;
  praiseCount: number;
  circles: string[];
}

export interface DetailData {
  product: ProductDetail;
  reviews: ProductReview[];
  notes: ProductNote[];
}
