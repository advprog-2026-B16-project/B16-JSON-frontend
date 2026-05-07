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
  status: string;
}
