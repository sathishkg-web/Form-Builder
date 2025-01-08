import { registerRootComponent } from 'expo';
import App from '../App';
import {AppRegistry,Platform,registerComponent} from '@react-navigation/native';
import {Name as appName} from '../app.json'

// Register the main component of your app with the AppRegistry

registerRootComponent(App);