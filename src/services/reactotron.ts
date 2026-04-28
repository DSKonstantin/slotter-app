import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reactotron = Reactotron.setAsyncStorageHandler!(AsyncStorage)
  .configure({ name: "Slotter" })
  .useReactNative({ networking: { ignoreUrls: /symbolicate|generate_204/ } })
  .use(reactotronRedux())
  .connect();

reactotron.clear?.();

declare global {
  interface Console {
    tron: typeof reactotron;
  }
}
console.tron = reactotron;

export default reactotron;
