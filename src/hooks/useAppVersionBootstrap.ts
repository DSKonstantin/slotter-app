import { useEffect, useState } from "react";
import { useAppDispatch } from "@/src/store/redux/store";
import { setAppVersion } from "@/src/store/redux/slices/appVersionSlice";
import axiosInstance from "@/src/store/redux/services/axios";

export function useAppVersionBootstrap(): boolean {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    axiosInstance.get("/app_version").then(({ data }) => {
      dispatch(
        setAppVersion({
          ispe: data.ispe,
          updateStatus: data.status,
          storeUrl: data.store_url,
        }),
      );
      setReady(true);
    });
  }, [dispatch]);

  return ready;
}
