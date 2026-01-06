import { registerRootComponent } from 'expo';
import { startNetworkLogging } from 'react-native-network-logger';

import App from './App';

startNetworkLogging();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
