interface IResponse<T> {
  success: boolean;
  message: string;
  result: T;
  error: unknown;
}

interface ICustomError {
  response: {
    data: {
      detail?: string;
      error?: string;
      [key: string]: string[] | string | undefined;
    };
  };
  status?: number;
}

interface ILoginDto {
  email: string;
  password: string;
}

interface ILoginResponse {
  access_token: string;
  refresh_token: string;
}

interface IResetPasswordDto {
  email: string;
}

interface IConfirmResetPasswordDto {
  token: string;
  password: string;
  confirmPassword?: string;
}

interface IProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
}

interface IRegisterDto {
  email: string;
  password: string;
}
