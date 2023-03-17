import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../components/firebase';

const UsersScreen = ({ navigation }) => {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                email: doc.data().email
            }));
            const dataWithoutCurrentUser = data.filter(user => user.email !== auth.currentUser.email);
            setUsers(dataWithoutCurrentUser);
        }
        getUsers();
    }, []);

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('Chat', { id: item.id, name: item.name, email: item.email })}
            >
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.email}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 10
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        elevation: 3
    },
    itemTitle: {
        fontSize: 20
    },
    itemSubtitle: {
        fontSize: 16,
        color: 'grey'
    }
});

export default UsersScreen;