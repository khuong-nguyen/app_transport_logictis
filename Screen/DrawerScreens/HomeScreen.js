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
import { ConfirmProvider, useConfirm } from 'react-native-confirm-dialog'

export default class HomeScreen extends Component{
  constructor(){
    super()
    this.state = {
      dataSource: []
    }
    dateDisplay = this.getCurrentDate();
  }

  async loadScheduleForDriverInDate(scheduleDate){
    var ACCESS_TOKEN = await AsyncStorage.getItem('token');
      var employee_id = await AsyncStorage.getItem('employee_id');
      //var fromDate = this.getCurrentDate();
      //var toDate = this.getCurrentDate();
      var fromDate = scheduleDate;
      var toDate = scheduleDate;
      let dataToSend = {driver_id: employee_id, from: fromDate, to: toDate};
      let formBody = [];
      let urlApi = Config.API_URL + '/api/transport-schedules/driver';
      for (let key in dataToSend) {
        let encodedKey = encodeURIComponent(key);
        let encodedValue = encodeURIComponent(dataToSend[key]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
      formBody = formBody.join('&');
      
      fetch(urlApi + '?' + formBody, {
        method: 'GET',
        headers: {
          //Header Defination
          'Authorization': 'Bearer ' + ACCESS_TOKEN
        },
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          dataSource: responseJson.data,
          isLoading: false
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async componentDidMount(){
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      dateDisplay = this.getCurrentDate();
      this.loadScheduleForDriverInDate(dateDisplay);
    });
  }
  
  /*componentWillUnmount() {
    // Remove the event listener
    this.focusListener.remove();
  }*/

  renderItem = ({ item }) => {
    return (
      <View style = {{flex: 1, flexDirection: 'row', marginBottom: 3}}>
        <View style = {{flex: 1, justifyContent: 'center'}}>
          <Text style = {{fontSize: 18, color: 'green', marginBottom: 15}}>
            Booking No: {item.booking_no}
          </Text>
          <Text style = {{fontSize: 16, color: 'black'}}>
          {item.driver_name} - {item.container_truck_code}
          </Text>
          <Text>
          Pickup plan: {item.pickup_plan}
          </Text>
          <Text>
          Delivery plan: {item.delivery_plan}
          </Text>
          <Text>
          Pickup address: {item.pickup_address}
          </Text>
          <Text>
          Delivery address: {item.delivery_address}
          </Text>
          <Text>
          Contact name: {item.booking.bkg_contact_name} - {item.booking.bkg_contact_tel}
          </Text>
          <View style={styles.container}>
            <Button style={styles.button} title="Từ chối" onPress={() => this.buttonRefuse(item.id)}/>
            <Button style={styles.button} title="Nhận lệnh" onPress={() => this.buttonConfirm(item.id)}/>
            <Button style={styles.button} title="Hoàn thành" onPress={() => this.buttonCompleted(item.id)}/>
      </View>
        </View>
      </View>
    )
  }

  buttonRefuse(schedule_id) {
    Alert.alert(
      'Confirm',
      'Are you sure?',
      [
        {text: 'NO', style: 'cancel'},
        {text: 'YES', onPress: () => this.refuseSchedule(schedule_id)},
      ]
    );
  }

  buttonConfirm(schedule_id) {
    Alert.alert(
      'Confirm',
      'Are you sure?',
      [
        {text: 'NO', style: 'cancel'},
        {text: 'YES', onPress: () => this.confirmSchedule(schedule_id)},
      ]
    );
  }

  buttonCompleted(schedule_id) {
    Alert.alert(
      'Confirm',
      'Are you sure?',
      [
        {text: 'NO', style: 'cancel'},
        {text: 'YES', onPress: () => this.completedSchedule(schedule_id)},
      ]
    );
  }

  async refuseSchedule(schedule_id){
    var ACCESS_TOKEN = await AsyncStorage.getItem('token');
    var employee_id = await AsyncStorage.getItem('employee_id');
    let dataToSend = {driver_id: employee_id, schedule_id: schedule_id};
    let formBody = [];
    let urlApi = Config.API_URL + '/api/transport-schedules/driver/refuse';
    for (let key in dataToSend) {
      let encodedKey = encodeURIComponent(key);
      let encodedValue = encodeURIComponent(dataToSend[key]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    
    fetch(urlApi + '?' + formBody, {
      method: 'PUT',
      headers: {
        //Header Defination
        'Authorization': 'Bearer ' + ACCESS_TOKEN
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.statusCode == 'OK'){
        this.loadScheduleForDriverInDate(dateDisplay);
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  async confirmSchedule(schedule_id){
    var ACCESS_TOKEN = await AsyncStorage.getItem('token');
    var employee_id = await AsyncStorage.getItem('employee_id');
    let dataToSend = {driver_id: employee_id, schedule_id: schedule_id};
    let formBody = [];
    let urlApi = Config.API_URL + '/api/transport-schedules/driver/confirm';
    for (let key in dataToSend) {
      let encodedKey = encodeURIComponent(key);
      let encodedValue = encodeURIComponent(dataToSend[key]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    
    fetch(urlApi + '?' + formBody, {
      method: 'PUT',
      headers: {
        //Header Defination
        'Authorization': 'Bearer ' + ACCESS_TOKEN
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.statusCode == 'OK'){
        this.loadScheduleForDriverInDate(dateDisplay);
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  async completedSchedule(schedule_id){
    var ACCESS_TOKEN = await AsyncStorage.getItem('token');
    var employee_id = await AsyncStorage.getItem('employee_id');
    let dataToSend = {driver_id: employee_id, schedule_id: schedule_id};
    let formBody = [];
    let urlApi = Config.API_URL + '/api/transport-schedules/driver/completed';
    for (let key in dataToSend) {
      let encodedKey = encodeURIComponent(key);
      let encodedValue = encodeURIComponent(dataToSend[key]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    
    fetch(urlApi + '?' + formBody, {
      method: 'PUT',
      headers: {
        //Header Defination
        'Authorization': 'Bearer ' + ACCESS_TOKEN
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.statusCode == 'OK'){
        console.log(responseJson.statusCode);
        this.loadScheduleForDriverInDate(dateDisplay);
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  renderSeparator = () => {
    return (
      <View
        style = {{ height: 3, width: "100%" , backgroundColor: 'red'}}>
      </View>
    )
  }
  emptyListMessage = () => {
    return (
      // Flat List Item
      <Text>
          No Schedule Today Found
      </Text>
      
    );
  };
  getCurrentDate=()=>{

    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear();

    //Alert.alert(date + '-' + month + '-' + year);
    // You can turn it in to your desired format
    return date + '/' + month + '/' + year;//format: dd-mm-yyyy;
  }

  getNextDateSchedule=()=>{
    var parts = dateDisplay.split("/");
  //return new Date(parts[2], parts[1] - 1, parts[0])
    var nextDate = new Date(parts[2],parts[1], parts[0]);
    var date = nextDate.getDate() + 1;
    var month = nextDate.getMonth();
    var year = nextDate.getFullYear();
    dateDisplay = date + '/' + month + '/' + year;
    console.log(dateDisplay);
    this.loadScheduleForDriverInDate(dateDisplay);
  }

  getPreviousDateSchedule=()=>{
    var parts = dateDisplay.split("/");
  //return new Date(parts[2], parts[1] - 1, parts[0])
    var nextDate = new Date(parts[2],parts[1], parts[0]);
    var date = nextDate.getDate() - 1;
    var month = nextDate.getMonth();
    var year = nextDate.getFullYear();
    dateDisplay = date + '/' + month + '/' + year;
    console.log(dateDisplay);
    this.loadScheduleForDriverInDate(dateDisplay);
  }

  render() {
  return (
    this.state.isLoading
    ?
    <View style = {{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <ActivityIndicator size = "Large" color = "#330066" animating/>
    </View>
    :
    <View style={{flex: 1}}>
      <FlatList
        data = {this.state.dataSource}
        renderItem = {this.renderItem}
        keyExtractor = {(item, index) => index}
        ItemSeparatorComponent = {this.renderSeparator}
        ListEmptyComponent={this.emptyListMessage()}
      />
      <View style={{flex: 1}}>
        <View style={{flex: 1, flexDirection: 'row',justifyContent: 'flex-end'}}>
          <TouchableOpacity
            style={{width:'50%',height:40,backgroundColor:'red', 
            alignItems:'center',justifyContent:'center'}}
            onPress={() => this.getPreviousDateSchedule()}
          >
            <Text style={{color:'white', fontSize: 16}}>Previous Date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{width:'50%',height:40,backgroundColor:'red', 
            alignItems:'center',justifyContent:'center'}}
            onPress={() => this.getNextDateSchedule()}
          >
            <Text style={{color:'white', fontSize: 16}}>Next Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  button: {
    backgroundColor: 'blue',
    width: '30%',
    height: 40
  }
});
