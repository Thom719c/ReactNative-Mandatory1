/* // import React, { useState, useEffect } from 'react';
import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback
} from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../components/firebase';
import { signOut } from 'firebase/auth';
import { GiftedChat } from 'react-native-gifted-chat'

const ChatScreen = ({ navigation, logout }) => {

    const [messages, setMessages] = useState([]);

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{
                        marginRight: 10
                    }}
                    onPress={onSignOut}
                >
                    <AntDesign name="logout" size={24} color={"grey"} style={{ marginRight: 10 }} />
                </TouchableOpacity>
            )
        });
    }, [navigation]);

    useLayoutEffect(() => {

        const collectionRef = collection(db, 'chatrooms');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, querySnapshot => {
            console.log('querySnapshot unsusbscribe');
            setMessages(
                querySnapshot.docs.map(doc => ({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user
                }))
            );
        });
        return unsubscribe;
    }, []);

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages)
        );

        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(db, 'chatrooms'), {
            _id,
            createdAt,
            text,
            user
        });
    }, []);

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={false}
            showUserAvatar={false}
            onSend={messages => onSend(messages)}
            messagesContainerStyle={{
                backgroundColor: '#fff'
            }}
            textInputStyle={{
                backgroundColor: '#fff',
                borderRadius: 20,
            }}
            user={{
                _id: auth?.currentUser?.email,
                avatar: 'https://i.pravatar.cc/300'
            }}
        />
    );
};

export default ChatScreen;
*/


import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Keyboard } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../../components/firebase';
import { signOut } from 'firebase/auth';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';

const ChatScreen = ({ route, navigation }) => {
    const [messages, setMessages] = useState([]);
    const [chatroomId, setChatroomId] = useState(null);

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

        const { _id, createdAt, text, user } = messages[0];

        if (chatroomId) {
            // Update existing chatroom document
            const chatroomRef = doc(db, 'chats', chatroomId);
            getDoc(chatroomRef)
                .then((doc) => {
                    if (doc.exists()) {
                        const messages = doc.data().messages;
                        updateDoc(chatroomRef, { messages: [...messages, { _id, createdAt, text, user }] })
                            .catch(error => console.log('Error updating chatroom: ', error));
                    }
                })
                .catch((error) => console.log('Error fetching chatroom: ', error));
        } else {
            // Create new chatroom document
            const chatsRef = collection(db, 'chats');
            const chatroom = {
                messages: [{ _id, createdAt, text, user }],
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
    }, [chatroomId, email]);

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
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ChatScreen;






