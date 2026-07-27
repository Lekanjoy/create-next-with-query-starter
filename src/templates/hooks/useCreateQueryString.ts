"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

const useCreateQueryString = () => {
  const searchParams = useSearchParams();

  const createQueryParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  return { createQueryParams };
};

export default useCreateQueryString;
