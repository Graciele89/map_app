
import React, { useRef, useState } from 'react';
import MapView, { Callout, LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Dimensions, Text, Touchable, TouchableOpacity, FlatList, Button, ScrollView } from 'react-native';
import { GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY, places } from './environments';
import { placeTypes } from './environments'
import Constants from "expo-constants";
import MapViewDirections from 'react-native-maps-directions';
import { StatusBar } from 'expo-status-bar';
import Geolocation from '@react-native-community/geolocation';
import GetMarkColor from './components/Coloring';

// https://docs.expo.dev/versions/latest/sdk/map-view/
// https://www.npmjs.com/package/react-native-google-places-autocomplete
// https://www.npmjs.com/package/react-native-maps-directions


const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
latitude: 53.3498019,           // location where i got the cordinates from the Spire
longitude: -6.260254172727272,  // https://www.maps.ie/coordinates.html
latitudeDelta: LATITUDE_DELTA,
longitudeDelta: LONGITUDE_DELTA,
};


type InputAutocompleteProps ={
  label: string;
  placeholder: string;
  onPlaceSelected: (details: GooglePlaceDetail | null) => void;
};


function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
}: InputAutocompleteProps) {
  return(
    <>
    <Text>{label}</Text>
    <GooglePlacesAutocomplete
    styles={{ textInput: styles.input }}
    placeholder={placeholder || ""} 
    fetchDetails
    onPress={(data, details = null) => {
      onPlaceSelected(details);
    }}
    query={{
      key: GOOGLE_API_KEY,
      language: "en"
    }}
    />
  </>
  )
}

export default function App() {
  
  const [origin, setOrigin] = useState<LatLng | null>()
  const [destination, setDestination] = useState<LatLng | null>()
  const [showDirections, setShowDirections] = useState(false)
  const [ distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const mapRef = useRef<MapView>(null);
  // const arr: any[] = [];
  // const [markers, setMarkers] = useState(arr)

  // to move the camera to place selected
  const moveTo = async(position: LatLng) => {
  const camera = await mapRef.current?.getCamera()
  if (camera){
    camera.center = position;
    mapRef.current?.animateCamera(camera, {duration: 1000}) //one second
  }
};

const edgePaddingValue = 90;

const edgePadding = {
  top: edgePaddingValue,
  right: edgePaddingValue,
  bottom: edgePaddingValue,
  left: edgePaddingValue,
};

const traceRouteOnReady = (args: any) => {
if (args){
    setDistance(args.distance)
    setDuration(args.duration)
  }
}

const traceRoute = () => {
  if (origin && destination) {
    setShowDirections(true)
    mapRef.current?.fitToCoordinates([origin, destination], {edgePadding})
  }
}

const onPlaceSelected = (
  details:GooglePlaceDetail | null,
   flag: "origin" | "destination"
   ) => {
    const set = flag === "origin" ? setOrigin : setDestination
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0
    }
    set (position);
    moveTo(position);
};



// loadMarkersLocations()

// function loadMarkersLocations() {
//     fetch('https://gist.githubusercontent.com/saravanabalagi/541a511eb71c366e0bf3eecbee2dab0a/raw/bb1529d2e5b71fd06760cb030d6e15d6d56c34b3/places.json')
//         .then(response => response.json())
//         .then(markersLocation => setMarkers(markersLocation));
// }


return (
    <View style={styles.container}>
     <MapView
        ref={mapRef}
        style={styles.map} 
        provider={PROVIDER_GOOGLE} 
        initialRegion={INITIAL_POSITION} 
        >
          {/* <>
        {markers.map((marker, index) => {
                    <Marker
                        key={index}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        title={marker.name}
                        pinColor={GetMarkColor(marker.place_type_id)}>
                    </Marker>
            })} */}
          {origin && <Marker coordinate={origin} /> }
          {destination && <Marker coordinate={destination} />}
          {showDirections && origin && destination && (
          <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_API_KEY}
          strokeColor="#0000dd"
          strokeWidth={4}
          onReady={traceRouteOnReady}//show distance and duration from origin to destination
          
        />

            

        )}

{/* </> */}
     </MapView>

       <View style={styles.searchContainer}>

          <InputAutocomplete
          label="Origin"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "origin");
          } } placeholder={''}         />
          <InputAutocomplete
          label="Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          } } placeholder={''}      />
          <TouchableOpacity style={styles.button} onPress={traceRoute}>
            <Text style={styles.buttonText}>Trace Route</Text>
          </TouchableOpacity>



          {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)}</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
          </View>
         ): null} 
       </View>

    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  // applying some style to the search box
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "#EEE",
    shadowColor: "Black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,   //android
    elevation: 5,     // ios
    padding: 4,
    borderRadius: 7,
    top: Constants.statusBarHeight,
    marginHorizontal: 20,
  },
  input: {
    borderColor: "#DDD",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#ccc",
    paddingVertical: 15,
    marginLeft: 45,
    marginRight: 45,
    marginTop: 15,
    borderRadius: 7,
  },
  buttonText: {
    textAlign: "center",
  }


});





 
// ps. on terminal instal de dependencies: npx expo install react-native-maps







// example of use of Flatlist:

// const Place = ({place}) => {
//   return(
//     <View style={{
//       padding: 8,
//     }}>
//       <Text key={place.id}>{place.name}</Text>
//       <Button title="Click me" />
//     </View>
//   )
// }



// <View style={styles.container}>
// <Text>Select Place</Text>
// <FlatList
//   data={places}
//   renderItem={({ item })=> {
//     return (
//       <Place place={item} />
//     )
//   }}
//   KeyExtrator={ e => e.id } />
//   <StatusBar style="auto" />
// </View>