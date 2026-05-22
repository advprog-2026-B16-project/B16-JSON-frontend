export interface ProblemDetail {
  title: string;
  detail: string;
  errorCode?: string;
  status?: number;
}

export interface UserLoginResponse {
  token: string;
  role: string;
  id: string; // UUID
  username: string;
}

export interface ProfileResponseDTO {
  id: string; // UUID
  username: string;
  email: string;
  fullName: string;
  bio: string;
  location: string;
  role: string;
  status?: string;
  avatarUrl?: string;
  successfulTransactions?: number;
}

export interface UpgradeRequest {
  fullName: string;
  credential: string; // URL/Base64
}

export interface UpgradeRequestResponse {
  id: string; // UUID
  createdAt: string;
  requesterUserId: string;
  requesterUsername: string;
  fullName: string;
  credential: string;
  socialMediaUrl?: string;
  status: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  originCountry: string;
  purchaseDate: string;
  jastiperId: string;
  jastiperUsername?: string;
  jastiperName?: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  originCountry: string;
  purchaseDate: string;
  jastiperId: string;
}
