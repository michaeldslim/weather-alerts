import { registerRootComponent } from 'expo';
import { configureNotifications } from './src/services/notificationService';

import App from './App';

configureNotifications();

registerRootComponent(App);
