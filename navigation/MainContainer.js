import React from 'react'
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons'

//Screens
import HomeScreen from './screens/HomeScreen';
import RecognizeScanner from './screens/RecognizeScanner';
import ChatScreen from './screens/ChatScreen';
import UsersScreen from './screens/UsersScreen';

//Screen Names
const homeName = "Home"
const recognizeScannerName = "Scanner Recognizer"
const chatName = "Chatti";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ChatStackScreen = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name={'Chat list'}
                component={UsersScreen}
                options={{ title: 'Chat list' }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: 'Chat' }}
            />
        </Stack.Navigator>
    );
};

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
                        } else if (rn === chatName) {
                            iconName = focused ? 'chatbubble' : 'chatbubble-outline'
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
                {/* <Tab.Screen name={chatName} component={ChatScreen} /> */}
                <Tab.Screen name={chatName} component={ChatStackScreen} options={{ headerShown: false }} />
            </Tab.Navigator>
        </NavigationContainer>
    )
}

export default MainContainer
