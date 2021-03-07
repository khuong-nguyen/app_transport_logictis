// Example of Splash, Login and Sign Up in React Native
// https://aboutreact.com/react-native-login-and-signup/

// Import React and Component
import React,{ Component } from 'react';
import {
  View, 
  Text, 
  Button,
  SafeAreaView, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  ToastAndroid,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Config from "react-native-config";
import validator from 'validator';
import moment from 'moment';
import { format } from "date-fns";

export default class ScheduleDocumentScreen extends Component{
  constructor(props){
    super(props);
    scheduleId = props.route.params.scheduleId;
    console.log(scheduleId);
  }

  render() {
    return (
      <View style = {{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text>Schedule Document</Text>
      </View>
    );
    }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    marginBottom: 2,
    marginTop: 2
  },
  button: {
    backgroundColor: 'blue',
    width: '30%',
    height: 40
  },
  bottomView: {
    width: '100%',
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
    flexDirection: 'row'
  }
});