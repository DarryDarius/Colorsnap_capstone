export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
};
