import { Redirect } from "expo-router";
import { Routers } from "@/src/constants/routers";

export default function Index() {
  // This initial route will be redirected by the group layouts
  // depending on the user's authentication status.
  return <Redirect href={Routers.app.home.services.root} />;
}
