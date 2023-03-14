import React from 'react'
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from 'react-native-vector-icons/Ionicons'

//Screens
import HomeScreen from './screens/HomeScreen';
import RecognizeScanner from './screens/RecognizeScanner';

//Screen Names
const homeName = "Home"
const recognizeScannerName = "Scanner Recognizer"

const Tab = createBottomTabNavigator();

const MainContainer = (props) => {
  return (
    <NavigationContainer>
        <Tab.Navigator initialRouteName={homeName}
        screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        let rn = route.name;
                        if (rn === homeName) {
                            iconName = focused ? 'home' : 'home-outline'
                        } else if (rn === recognizeScannerName) {
                            iconName = focused ? 'camera' : 'camera-outline'
                        } 
                        return <Ionicons name={iconName} size={size} color={color} />
                    },
                    tabBarStyle: {
                        padding: 10,
                        height: 75
                    },
                    tabBarActiveTintColor: 'green',
                    tabBarInactiveTintColor: 'grey',
                    tabBarLabelStyle: {
                        fontSize: 10
                    },
                    tabBarStyle: [
                        {
                            display: "flex"
                        },
                        null
                    ]
                })}>
                    <Tab.Screen name={homeName} component={HomeScreen} />                    
                    <Tab.Screen name={recognizeScannerName} component={RecognizeScanner} />                    
        </Tab.Navigator>
    </NavigationContainer>
  )
}

export default MainContainer