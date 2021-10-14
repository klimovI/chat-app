import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

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
        if (!data) return history.push('/');

        setMessages(data);
        socket.emit('join', { chatID, user });

        socket.on('message', message => {
          setMessages(prev => [...prev, message]);
        });

        socket.on('setChats', setChats);
  
        socket.on('setUsers', newUsers => {
          setUsers([...new Set(newUsers)]);
        });
      });

    return () => {
      socket.off('message');
      socket.off('setChats');
      socket.off('setUsers');
    }
  }, [chatID]);

  const sendMessage = () => {
    if (message) {
      const user = localStorage.getItem('user');
      socket.emit('message', { user, text: message }, () => setMessage(''));
    }
  }

  const changeChat = id => {
    socket.emit('leave');

    history.push(`/chat/${id}`)
  }

  return (
    <main>
      <div className="chatBlock">
        <div className="chatsBlock">
          <h1 className="chatBlockTitle">Chats</h1>
          <div className="chats">
            {chats.map(({ _id, name }, i) => (
              <div
                key={i}
                className={`chat ${_id === chatID && 'highlight'}` }
                onClick={() => changeChat(_id)}
                
              >{name}</div>
            ))}
          </div>
        </div>
        <div className="messagesBlock">
          <h1 className="chatBlockTitle">Messages</h1>
          <div className="messagesBody">
            {messages.map(({ text, user }, i) => (
              <div key={i} className="message">
                <span className="userName">{user}:</span> {text}
              </div>
            ))}
          </div>
          <div className="footer">
            <input
            className="chatBlockInput"
              value={message}
              onChange={event => setMessage(event.target.value)}
              onKeyPress={({ key }) => key === 'Enter' && sendMessage()}
            ></input>
            <button className="chatBlockButton" onClick={sendMessage}>Send</button>
          </div>
        </div>
        <div className="usersBlock">
          <h1 className="chatBlockTitle">Users</h1>          
          {users.map((user, i) => (
            <div key={i} className="user">{user}</div>
          ))}
        </div>
      </div>
    </main>
  );
}


export default Chat;
