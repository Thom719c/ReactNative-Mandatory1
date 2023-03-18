import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db, auth, storage } from '../../components/firebase';
import { signOut } from 'firebase/auth';
import { GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import uuid from 'react-native-uuid';

const ChatScreen = ({ route, navigation }) => {
    const [messages, setMessages] = useState([]);
    const [chatroomId, setChatroomId] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    const { id, name, email } = route.params;
    const otherUserEmail = email; // get the email of the other person in the chat

    const onSignOut = () => {
        signOut(auth).catch((error) => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            title: name,
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 10 }} onPress={onSignOut}>
                    <AntDesign name="logout" size={24} color={'grey'} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, name]);

    useEffect(() => {
        // Fetch existing chatroom or create a new one for the two users
        const fetchOrCreateChatroom = async () => {
            const users = [auth.currentUser.email, email];
            const querySnapshot = await getDocs(collection(db, 'chats'));
            const chatrooms = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const chatroom = chatrooms.find((chat) => chat.users.includes(users[0]) && chat.users.includes(users[1]));

            if (chatroom) {
                // Use existing chatroom
                const chatroomId = chatroom.id;
                setChatroomId(chatroomId);
            } else {
                // Create new chatroom
                const chatroom = {
                    messages: [],
                    users,
                };
                const docRef = await addDoc(collection(db, 'chats'), chatroom);
                const chatroomId = docRef.id;
                setChatroomId(chatroomId);
            }
        };

        fetchOrCreateChatroom();
    }, [email]);

    useEffect(() => {
        let unsubscribe;

        if (chatroomId) {
            const chatroomRef = doc(db, 'chats', chatroomId);
            unsubscribe = onSnapshot(chatroomRef, (doc) => {
                const messages = doc.data().messages.map(message => ({
                    _id: message._id,
                    text: message.text,
                    createdAt: message.createdAt.toDate(),
                    image: message.image || "",
                    user: {
                        _id: message.user._id,
                        name: message.user.name
                    }
                }));
                setMessages(messages.reverse());
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [chatroomId]);

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

        const { _id, createdAt, text, user, image } = messages[0];

        if (chatroomId) {
            // Update existing chatroom document
            const chatroomRef = doc(db, 'chats', chatroomId);
            getDoc(chatroomRef)
                .then((doc) => {
                    if (doc.exists()) {
                        console.log("URL: ", imageUrl)
                        const messages = doc.data().messages;
                        updateDoc(chatroomRef, { messages: [...messages, { _id, createdAt, text, user, image: imageUrl || "" }] })
                            .catch(error => console.log('Error updating chatroom: ', error));
                    }
                })
                .catch((error) => console.log('Error fetching chatroom: ', error));
        } else {
            // Create new chatroom document
            const chatsRef = collection(db, 'chats');
            const chatroom = {
                messages: [{ _id, createdAt, text, user, image }],
                users: [auth.currentUser.email, email],
            };
            addDoc(chatsRef, chatroom).then((docRef) => {
                const newChatroomId = docRef.id;

                // Update the logged-in user's chatroom document
                const userRef = doc(db, 'users', auth.currentUser.email);
                getDoc(userRef)
                    .then((doc) => {
                        if (doc.exists()) {
                            const chatrooms = doc.data().chatrooms;
                            const updatedChatrooms = [...chatrooms, { chatroomId: newChatroomId, otherUserEmail, lastMessage: text }];
                            updateDoc(userRef, { chatrooms: updatedChatrooms }).catch((error) => console.log('Error updating chatrooms: ', error));
                        } else {
                            console.log(`User with email ${auth.currentUser.email} doesn't exist`);
                        }
                    })
                    .catch((error) => console.log('Error fetching user: ', error));
            });
        }
    }, [chatroomId, email, imageUrl]);

    const handleChoosePhotoFromLib = async () => {
        let response = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!response.canceled) {
            uploadImage(response.assets[0].uri);
        } else {
            alert('You did not select any image.');
        }
    };

    const getCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
        } else {
            openCamera();
        }
    }

    const openCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });
        console.log(result);
        if (result.didCancel && result.didCancel == true) {
        } else {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageData) => {
        let generatedNameWithUUID = uuid.v4();
        const reference = ref(storage, generatedNameWithUUID);
        const pathToFile = imageData;

        const response = await fetch(pathToFile);
        const blobFile = await response.blob();
        await uploadBytes(reference, blobFile);

        const url = await getDownloadURL(reference);
        console.log(url)
        setImageUrl(url);
    };

    return (
        <GiftedChat
            key={id}
            messages={messages}
            onSend={onSend}
            messagesContainerStyle={{
                backgroundColor: '#fff'
            }}
            textInputStyle={{
                backgroundColor: '#fff',
                borderRadius: 20,
            }}
            user={{ _id: auth.currentUser.email }}
            renderSend={props => {
                return (
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                        {imageUrl !== '' ? (
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: '#fff',
                                    marginRight: 10,
                                }}>
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        position: 'absolute',
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={() => {
                                        setImageUrl('');
                                    }}>
                                    <Image
                                        source={require('../../assets/close.png')}
                                        style={styles.imageCross}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                        <TouchableOpacity
                            style={{ marginRight: 20 }}
                            onPress={() => {
                                getCameraPermission();
                            }}>
                            <Image
                                source={require('../../assets/photo-camera.png')}
                                style={{ width: 20, height: 20 }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginRight: 20 }}
                            onPress={() => {
                                handleChoosePhotoFromLib();
                            }}>
                            <Image
                                source={require('../../assets/image.png')}
                                style={{ width: 20, height: 20 }}
                            />
                        </TouchableOpacity>
                        <Send {...props} containerStyle={{ justifyContent: 'center' }}>
                            <Image
                                source={require('../../assets/send.png')}
                                style={styles.imageIconSend}
                            />
                        </Send>
                    </View>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageCross: {
        width: 16,
        height: 16,
        tintColor: '#fff',
        marginLeft: 5,
        marginTop: 2,
    },
    imageIconSend: {
        width: 20,
        height: 20,
        marginRight: 10,
        tintColor: 'blue',
    }
});

export default ChatScreen;






