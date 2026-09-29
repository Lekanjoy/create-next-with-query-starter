import { api } from "@/query/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AUTH } from "@/constants/apiRoutes";

const useLoginApi = () =>
  useMutation<IResponse<ILoginResponse>, ICustomError, ILoginDto>({
    mutationFn: (body) => api.post<IResponse<ILoginResponse>>(AUTH.login, body),
  });

const useLogoutApi = () =>
  useMutation<string, Error, void>({
    mutationFn: () => api.post<string>(AUTH.logout),
  });

const useResetPasswordApi = () =>
  useMutation<IResponse<{ status: string }>, ICustomError, IResetPasswordDto>({
    mutationFn: (body) =>
      api.post<IResponse<{ status: string }>>(AUTH.resetPassword, body),
  });

const useConfirmResetPasswordApi = () =>
  useMutation<
    IResponse<{ status: string }>,
    ICustomError,
    IConfirmResetPasswordDto
  >({
    mutationFn: (body) =>
      api.post<IResponse<{ status: string }>>(AUTH.confirmReset, body),
  });

const useGetUserApi = () =>
  useQuery<IResponse<IProfileResponse>, ICustomError>({
    queryKey: ["user", "profile"],
    queryFn: () => api.get<IResponse<IProfileResponse>>(AUTH.profile),
  });

export {
  useLoginApi,
  useLogoutApi,
  useResetPasswordApi,
  useConfirmResetPasswordApi,
  useGetUserApi,
};
