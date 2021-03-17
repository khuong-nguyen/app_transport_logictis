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
  Alert,
  TouchableHighlight,
  PermissionsAndroid,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Config from "react-native-config";
import validator from 'validator';
import moment from 'moment';
import { format } from "date-fns";
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';

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
        alert(error);
      })
  }
  getScheduleColor(schedule){
    var color =schedule.schedule_status == 'INPROCESS' ? '#b3d1ff' : 'white';
    return color;
  }
  async componentDidMount(){
    const { navigation } = this.props;
    dateDisplay = this.getCurrentDate();
    this.focusListener = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      this.loadScheduleForDriverInDate(dateDisplay);
    });
  }
  
  _onPress(item) {
    this.props.navigation.navigate('ScheduleDocument', {
      scheduleId: item.id
    });
  }

  renderItem = ({ item }) => {
    return (
      <TouchableHighlight style={{flex: 1}} onPress={()=> this._onPress(item)}>
        <View style = {{flex: 1, backgroundColor: this.getScheduleColor(item)}}>
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 10}}>
            <Text style = {{fontSize: 18, color: 'green', paddingLeft: 5, width: '30%'}}>
                Booking No:
            </Text>
            <Text style = {{fontSize: 18, color: 'green', paddingRight: 5, textAlign: 'right', width: '70%'}}>
                {item.booking_no}
            </Text>
          </View>
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 8}}>
            <Text style = {{fontSize: 16, color: 'black', width: '25%', paddingLeft: 5}}>
              Driver:
            </Text>
            <Text style = {{fontSize: 16, color: 'black', textAlign: 'right', width: '75%', paddingRight: 5}}>
              {item.driver_name} - {item.container_truck_code}
            </Text>
          </View>  
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 1}}>
            <Text style = {{fontSize: 16, color: 'black', width: '30%', paddingLeft: 5}}>
              Pickup plan:
            </Text>
            <Text style = {{fontSize: 16, color: 'black', textAlign: 'right', width: '70%', fontWeight: 'bold', paddingRight: 5}}>
              {item.pickup_plan}
            </Text>
          </View>
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 8}}>
            <Text style = {{fontSize: 14, color: 'black', textAlign: 'right', fontStyle: 'italic', width: '100%', paddingRight: 5}}>
              Pickup address: {item.pickup_address}
            </Text>
          </View>
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 1}}>
            <Text style = {{fontSize: 16, color: 'black', width: '30%', paddingLeft: 5}}>
              Delivery plan:
            </Text>
            <Text style = {{fontSize: 16, color: 'black', textAlign: 'right', width: '70%', fontWeight: 'bold', paddingRight: 5}}>
              {item.delivery_plan}
            </Text>
          </View>
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 8}}>
            <Text style = {{fontSize: 14, color: 'black', textAlign: 'right', fontStyle: 'italic', width: '100%', paddingRight: 5}}>
              Delivery address: {item.delivery_address}
            </Text>
          </View>
          <View style = {{flex: 1, flexDirection: 'row', marginBottom: 3}}>
            <Text style = {{fontSize: 16, color: 'black', width: '25%', paddingLeft: 5}}>
              Contact:
            </Text>
            <Text style = {{fontSize: 16, color: 'black', textAlign: 'right', width: '75%', paddingRight: 5}}>
              {item.booking.bkg_contact_name} - {item.booking.bkg_contact_tel}
            </Text>
          </View>
            
            <View style={styles.container}>
              <Button style={styles.button} title="Từ chối" onPress={() => this.buttonRefuse(item.id)}/>
              {
                (() => {
                    if (item.schedule_status != 'INPROCESS')
                        return <Button style={styles.button} title="Nhận lệnh" onPress={() => this.buttonConfirm(item.id)}/>
                })()
            }
              <Button style={styles.button} title="Hoàn thành" onPress={() => this.buttonCompleted(item.id)}/>
            </View>
        </View>
      </TouchableHighlight>
      
      
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
      alert(error);
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
      alert(error);
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
        this.loadScheduleForDriverInDate(dateDisplay);
      }
    })
    .catch((error) => {
      alert(error);
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
          No Schedule Found
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
    var strDay =  '00' + parts[0];
    strDay = strDay.substr(strDay.length - 2,2);
    
    var strMonth =  '00' + parts[1];
    strMonth = strMonth.substr(strMonth.length - 2,2);

    var strDate = parts[2] + '-' + strMonth + '-' + strDay + 'T00:00:00.000Z';

    var nextDate = new Date(strDate);
    var tomorrow = moment(nextDate).add(1, 'day');

    dateDisplay = tomorrow.format('DD/MM/YYYY');;

    this.loadScheduleForDriverInDate(dateDisplay);
  }

  getPreviousDateSchedule=()=>{

    var parts = dateDisplay.split("/");
  
    var strDay =  '00' + parts[0];
    strDay = strDay.substr(strDay.length - 2,2);
    
    var strMonth =  '00' + parts[1];
    strMonth = strMonth.substr(strMonth.length - 2,2);

    var strDate = parts[2] + '-' + strMonth + '-' + strDay + 'T00:00:00.000Z';
   
    var prvDate = new Date(strDate);
    var yesterday = moment(prvDate).add(-1, 'day');

    dateDisplay = yesterday.format('DD/MM/YYYY');;
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
      <View style={styles.bottomView}>
          <TouchableOpacity
            style={{width:'30%',height:30,backgroundColor:'blue', 
            alignItems:'center',justifyContent:'center'}}
            onPress={() => this.getPreviousDateSchedule()}
          >
            <Text style={{color:'white', fontSize: 16}}>Previous Date</Text>
          </TouchableOpacity>
          <Text
            style={{width:'40%',height:30,backgroundColor:'gray', 
            textAlign:'center',color:'white', fontSize: 16}}
          >
            {dateDisplay}
          </Text>
          <TouchableOpacity
            style={{width:'30%',height:30,backgroundColor:'red', 
            alignItems:'center',justifyContent:'center'}}
            onPress={() => this.getNextDateSchedule()}
          >
            <Text style={{color:'white', fontSize: 16}}>Next Date</Text>
          </TouchableOpacity>
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