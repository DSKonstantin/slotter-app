import { Redirect } from "expo-router";

export default function Index() {
  // This initial route will be redirected by the group layouts
  // depending on the user's authentication status.
  return <Redirect href="/(app)/home" />;
}
