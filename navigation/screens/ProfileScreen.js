import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../components/firebase';
import { signOut } from 'firebase/auth';
import { AntDesign } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState([]);

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log('Error logging out: ', error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 10 }} onPress={onSignOut}>
          <AntDesign name="logout" size={24} color={'grey'} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    // Fetch existing chatroom or create a new one for the two users
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
      const foundUser = users.find((user) => user.email.includes(auth.currentUser.email));
      setUser(foundUser);
    };
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.profileImage}
          source={require('../../assets/defaultProfilImage.png')}
        />
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemSubtitle}>Name</Text>
        <Text style={styles.itemTitle}>{user.name}</Text>
      </View>
      <View style={styles.itemContainer}>
        <Text style={styles.itemSubtitle}>E-mail</Text>
        <Text style={styles.itemTitle}>{user.email}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20
  },
  imageContainer: {
    alignItems: 'center',
    padding: 15
  },
  itemTitle: {
    fontSize: 20
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'grey'
  }
});

export default ProfileScreen
