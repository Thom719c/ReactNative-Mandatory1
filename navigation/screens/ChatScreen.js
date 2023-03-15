// import React, { useState, useEffect } from 'react';
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
import { GiftedChat } from 'react-native-gifted-chat'

/* const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState([]);

    const sendMessage = (text) => {
        const newMessage = { id: Math.random().toString(), text: text };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.messageList}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    onChangeText={(text) => setInputText(text)}
                />
                <TouchableOpacity onPress={() => sendMessage(inputText)}>
                    <Ionicons name="md-send" size={24} color="blue" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    messageList: {
        flex: 1,
        padding: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        padding: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginRight: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontSize: 16,
    },
});

export default ChatScreen; */

const ChatScreen = ({ navigation }) => {

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
        // setMessages([...messages, ...messages]);
        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(db, 'chatrooms'), {
            _id,
            createdAt,
            text,
            user
        });
    }, []);

    return (
        // <>
        //   {messages.map(message => (
        //     <Text key={message._id}>{message.text}</Text>
        //   ))}
        // </>
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

    /* return (
        <GiftedChat />
    ); */
};

export default ChatScreen;






