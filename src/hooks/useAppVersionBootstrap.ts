import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "@/src/store/redux/store";
import { setAppVersion } from "@/src/store/redux/slices/appVersionSlice";
import axiosInstance from "@/src/store/redux/services/axios";

interface AppVersionBootstrapResult {
  ready: boolean;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

export function useAppVersionBootstrap(): AppVersionBootstrapResult {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const bootstrap = useCallback(() => {
    setIsLoading(true);
    axiosInstance
      .get("/app_version")
      .then(({ data }) => {
        dispatch(
          setAppVersion({
            ispe: data.ispe,
            updateStatus: data.status,
            storeUrl: data.store_url,
          }),
        );
        setIsError(false);
        setReady(true);
      })
      .catch(() => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return { ready, isLoading, isError, retry: bootstrap };
}
