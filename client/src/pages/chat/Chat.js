import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Chats from '../../components/chats';
import Messages from '../../components/messages';
import Users from '../../components/users';

import axios from 'axios';
import socket from '../../socket';

import './style.css';

const Chat = () => {
  const history = useHistory();

  const { chatID } = useParams();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return history.push(`/?chat=${chatID}`);

    socket.connect();
  
    axios
      .get(`http://localhost:3001/chat/${chatID}`)
      .then(({ data }) => {
        // Redirect to 'Join' page if a chart with chatID doesn't exist
        if (!data) return history.push('/');

        setMessages(data);

        socket.emit('join', { chatID, user });

        socket.on('setChats', setChats);
        socket.on('setUsers', setUsers);
        socket.on('message', message => {
          setMessages(prev => [...prev, message]);
        });
      });

    return () => {
      socket.off('message');
      socket.off('setChats');
      socket.off('setUsers');
    }
  }, [chatID]);

  return (
    <main>
      <div className="chatPage">
        <Chats chatID={chatID} chats={chats} />
        <Messages message={message} messages={messages} setMessage={setMessage} />
        <Users users={users} />
      </div>
    </main>
  );
}


export default Chat;
