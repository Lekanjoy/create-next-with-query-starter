"use client";
import {
  useConfirmResetPasswordApi,
  useGetUserApi,
  useLoginApi,
  useLogoutApi,
  useResetPasswordApi,
} from "@/api/auth.api";
import { extractErrorMsg } from "@/helpers";
import { deleteToken, getToken, saveToken } from "@/helpers";
import { queryClient } from "@/query/queryClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const useLoginService = () => {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLoginApi();

  const loginUser = (email: string, password: string) => {
    login(
      { email, password },
      {
        onSuccess: async (data) => {
          await Promise.all([
            saveToken("accessToken", data.result.access_token),
            saveToken("refreshToken", data.result.refresh_token),
          ]);
          toast.success("Signed in successfully");
          const search =
            typeof window !== "undefined" ? window.location.search : "";
          const redirectParam = new URLSearchParams(search).get("from");
          router.replace(redirectParam ?? "/");
        },
        onError: (err) => {
          toast.error(extractErrorMsg(err) ?? "Failed to sign in");
        },
      },
    );
  };

  return { loginUser, isLoggingIn: isPending, loginError: error };
};

const useLogoutService = () => {
  const { mutateAsync: logout, isPending } = useLogoutApi();
  const router = useRouter();

  const logoutUser = async () => {
    const refreshToken = await getToken("refreshToken");
    await logout(
      { refresh: refreshToken! },
      {
        onSuccess: async () => {
          await Promise.all([
            deleteToken("accessToken"),
            deleteToken("refreshToken"),
          ]);
          queryClient.clear();
          toast.success("Signed out successfully");
        },
        onError: () => {
          toast.error("Failed to sign out. Please try again.");
        },
      },
    );
    router.replace("/login");
  };

  return { logoutUser, isLoggingOut: isPending };
};

const useResetPasswordService = () => {
  const router = useRouter();
  const { mutateAsync: resetPassword, isPending, error } = useResetPasswordApi();

  const sendResetLink = (email: string) => {
    resetPassword(
      { email },
      {
        onSuccess: () => {
          router.replace(
            `/reset-password/confirm?email=${encodeURIComponent(email)}`,
          );
        },
        onError: (err) => {
          toast.error(extractErrorMsg(err) ?? "Failed to send reset link");
        },
      },
    );
  };

  return { sendResetLink, isSendingLink: isPending, resetError: error };
};

const useConfirmResetPasswordService = () => {
  const router = useRouter();
  const { mutate: confirmReset, isPending, error } =
    useConfirmResetPasswordApi();

  const confirmResetPassword = (body: IConfirmResetPasswordDto) => {
    confirmReset(body, {
      onSuccess: () => {
        toast.success("Password reset successfully");
        router.replace("/login");
      },
      onError: (err) => {
        toast.error(extractErrorMsg(err) ?? "Failed to reset password");
      },
    });
  };

  return {
    confirmResetPassword,
    isConfirmingReset: isPending,
    confirmError: error,
  };
};

const useFetchUserProfileService = () => {
  const { data, isLoading, error } = useGetUserApi();
  return { user: data?.result, isFetchingUser: isLoading, fetchUserError: error };
};

export {
  useLoginService,
  useLogoutService,
  useResetPasswordService,
  useConfirmResetPasswordService,
  useFetchUserProfileService,
};
