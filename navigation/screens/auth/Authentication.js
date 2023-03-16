import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signup from './Signup';
import Login from './Login';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../../../components/firebase';
import MainContainer from '../../MainContainer';

const Stack = createStackNavigator();

const Authentication = (props) => {
    const [authenticated, setAuthenticated] = useState(false);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            setAuthenticated(true);
        } else {
            setAuthenticated(false);
        }
    });

    if (authenticated) {
        return <MainContainer />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Login' component={Login} />
                <Stack.Screen name='Signup' component={Signup} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Authentication;