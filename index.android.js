/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Dimensions
} from 'react-native';
import './ReactotronConfig'
import MapView from 'react-native-maps'
import Polyline from '@mapbox/polyline';
import { Root , Container,Content, Header , View , Left, Body, Right, Button , Text ,Title , Input , Item , Icon, Fab , Footer , Spinner , ActionSheet } from 'native-base';

const {width,height} = Dimensions.get('window')
const SCREEN_HEIGHT = height
const SCREEN_WIDTH = width
const ASPECT_RATIO = width/height
const LATITUDE_DELTA = 0.098
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO 
var searchItem = ''
var arr = []
var actionArr = []

export default class tourist_app extends Component {
  constructor(props){
    super(props);
    this.state={
      initialPosition:{
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      changingData:{
        latitudeDelta:LATITUDE_DELTA,
        longitudeDelta:LONGITUDE_DELTA
      },
      markerPosition:{
        latitude: 0,
        longitude: 0,
      },
      active: 'true',
      coords:[],
      searchItem:'',
      searchResultObj:{},
      searchResultArr:[],
      actionArr:[],
      placeObj:{
        geometry:{
          latitude: 0,
          longitude: 0,
        }
      },
      loader:false,
      backBool:false

    }
    this.getDirections=this.getDirections.bind(this)
    this.getSearchResult=this.getSearchResult.bind(this)
    this.gettingDetails=this.gettingDetails.bind(this)
  }

  watchID: ?number = null
  componentDidMount(){
    navigator.geolocation.getCurrentPosition((position)=>{
      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)
      var initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      var marker = {
        latitude: lat,
        longitude: long,
        }
       this.setState({initialPosition:initialRegion,markerPosition:marker})
    },(err)=>{console.log(JSON.stringify(err))},
    {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000})
    this.watchID =navigator.geolocation.watchPosition((position)=>{
      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)
      var lastRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      var lastMarker = {
        latitude: lat,
        longitude: long,
        }
      this.setState({initialPosition:lastRegion,markerPosition:lastMarker})
    })
  }
  componentWillUnmount(){
    navigator.geolocation.clearWatch(this.watchID)
  }
  async getDirections(startLoc, destinationLoc) {
    await this.setState({loader:true,backBool:true})
    await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=AIzaSyAfTjS53dxesYuntwAlCdfuJAevYLIy1uA`)
    .then((response) => response.json())
    .then((responseJson) => {
      var points = Polyline.decode(responseJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return  {
            latitude : point[0],
            longitude : point[1]
        }
    })
    this.setState({coords: coords})
  })
  await this.setState({loader:false})
}
async gettingDetails(placeId){
  var placeObj = {}
  await this.setState({
    loader:true,
  })
  await fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=AIzaSyDAmNizz4ukNrpVYxvAQNw2-QPIo6uzgqs`)
  .then((response)=>response.json())
  .then((responseJson)=>{
    placeObj={
      address:responseJson.result.formatted_address,
      name:responseJson.result.name,
      icon:responseJson.result.icon,
      rating:(responseJson.result.rating) ? responseJson.result.rating :'None',
      phoneNumber:(responseJson.result.formatted_phone_number) ? responseJson.result.formatted_phone_number :'None',
      geometry: {
        latitude:responseJson.result.geometry.location.lat,
        longitude:responseJson.result.geometry.location.lng
      }
    }
    this.setState({
      placeObj:placeObj,
      initialPosition : {
        latitude : placeObj.geometry.latitude,
        longitude : placeObj.geometry.longitude,
        latitudeDelta:LATITUDE_DELTA,
        longitudeDelta : LONGITUDE_DELTA
      }
    })
  })
  await this.setState({loader:false})
}
async getSearchResult(search){
  var searchResultMainObj = {}
  arr = []
  actionArr = []
  await this.setState({loader:true})
    await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${search}&key=AIzaSyDAmNizz4ukNrpVYxvAQNw2-QPIo6uzgqs`)
    .then((response)=>response.json())
    .then((responseJson)=>{
      searchResultMainObj=responseJson
      for(var i = 0;i<searchResultMainObj.results.length;i++){
        arr.push({
          placeId:searchResultMainObj.results[i].place_id,
        })
        actionArr.push(searchResultMainObj.results[i].name)
      }
      actionArr.push('cancel')
    })
    await this.setState({loader:false})
  }
  render() {
    return (
      <Root>
        <Container>
          <Header style={styles.header} searchBar rounded padder>
            <Item>
              <Input placeholder="Search" onChangeText={(text)=>{
                searchItem = text.replace(/ /g,"+")
              }}/>
              {(this.state.loader===false) ? 
              <Button transparent onPress={()=>{
                if(this.state.backBool == false){
                  this.getSearchResult(searchItem)
                  ActionSheet.show(
                  {
                    options: actionArr,
                    cancelButtonIndex: actionArr.length,
                    title: "Search Result"
                  },
                  buttonIndex => {
                    if(buttonIndex !== actionArr.length){
                      this.gettingDetails(arr[buttonIndex].placeId)
                    }
                  }
                  )
                }
                else if(this.state.backBool == true){
                  this.setState({
                  coords:[],
                  backBool:false,
                  initialPosition:{ 
                    latitude:this.state.markerPosition.latitude,
                    longitude:this.state.markerPosition.longitude,
                    latitudeDelta:LATITUDE_DELTA,
                    longitudeDelta:LONGITUDE_DELTA
                    },
                  placeObj:{
                    geometry:{
                      latitude:0,
                      longitude:0
                    }
                  },

                })
                }
                }}>
                <Icon name={(this.state.backBool==true) ? 'close':'ios-search'} style={{color:'#619bf9'}} />
              </Button>:<Spinner color='#619bf9' />}
            </Item>
            <Button transparent>
              <Text>Search</Text>
            </Button>
          </Header>
            <View style={styles.view}>
              <MapView
              region={this.state.initialPosition}
              onRegionChange={(region)=>{this.setState({initialPosition:region,changingData:{latitudeDelta:region.latitudeDelta,longitudeDelta:region.longitudeDelta}})}}
              style={styles.map}
              showsCompass={true}
              loadingEnabled={true}
              showsBuildings={true}
              provider='google'
              >
                <MapView.Polyline 
                coordinates={this.state.coords}
                strokeWidth={6}
                strokeColor="#6da0f2"
                lineCap='round' />
                <MapView.Circle
                center={this.state.markerPosition}
                radius={this.state.changingData.latitudeDelta*1500}
                fillColor='#4082ed'
                strokeColor='#eaf2ff'
                strokeWidth={2}
                />
                <MapView.Marker
                coordinate={this.state.placeObj.geometry}
                onPress={()=>{
                  ActionSheet.show(
                  {
                    options: [
                      `Name : ${this.state.placeObj.name}`,
                      `Address : ${this.state.placeObj.address}`,
                      `Rating : ${this.state.placeObj.rating}`,
                      `Phone Number : ${this.state.placeObj.phoneNumber}`,
                      'Navigate',
                      'Cancel'
                        ],
                    cancelButtonIndex: 5,
                    title: "Search Result"
                  },
                buttonIndex => {
                   if(buttonIndex == 4){
                    this.getDirections(`${this.state.markerPosition.latitude},${this.state.markerPosition.longitude}`,`${this.state.placeObj.geometry.latitude},${this.state.placeObj.geometry.longitude}`)
                    console.log(buttonIndex)
                   }
                }
                )
                }}
                />
              </MapView>
              <Fab
                direction="up"
                containerStyle={{ }}
                style={{ backgroundColor: '#ffffff' }}
                position="bottomRight"
                onPress={()=>{this.setState({initialPosition:{latitude:this.state.markerPosition.latitude,longitude:this.state.markerPosition.longitude,latitudeDelta:LATITUDE_DELTA,longitudeDelta:LONGITUDE_DELTA}})}}
                >
                  <Icon name="navigate" style={{color:'#619bf9'}}/>
              </Fab>
            </View>
        </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  view: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex:1,
  },
  header: {
    bottom: '9.485%',
    backgroundColor:'#ffffff'
  },
  map: {
    position:'absolute',
    top:0,
    bottom:0,
    left:0,
    right:0,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('tourist_app', () => tourist_app);
