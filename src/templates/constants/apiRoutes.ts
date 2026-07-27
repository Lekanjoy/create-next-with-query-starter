import { base_url } from "@/constants/config";

const AUTH_BASE = "auth";

const AUTH = {
  login: `${AUTH_BASE}/login/`,
  logout: `${AUTH_BASE}/logout/`,
  resetPassword: `${AUTH_BASE}/password/reset/`,
  confirmReset: `${AUTH_BASE}/password/reset/confirm/`,
  refreshToken: `${base_url}${AUTH_BASE}/token/refresh/`,
  profile: `${AUTH_BASE}/profile/`,
};

export { AUTH };
