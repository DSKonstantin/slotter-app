import * as Yup from "yup";
import type { UploadFile } from "@/src/types/upload";

export const avatarField = Yup.mixed<UploadFile>().nullable().default(null);
