import socket from '../../socket';

import './style.css';

const Messages = ({ message, messages, setMessage }) => {
  const sendMessage = () => {
    if (message) {
      const user = localStorage.getItem('user');
      socket.emit('message', { user, text: message }, () => setMessage(''));
    }
  };

  return (
    <div className="messages">
      <h1 className="messagesTitle">Messages</h1>
      <div className="messagesList">
        {messages.map(({ text, user }, i) => (
          <div key={i} className="message">
            <span className="messageSender">
              {user}:
            </span>
            {text}
          </div>
        ))}
      </div>
      <div className="messageInputBlock">
        <input
        className="messageInput"
          value={message}
          onChange={event => setMessage(event.target.value)}
          onKeyPress={({ key }) => key === 'Enter' && sendMessage()}
        ></input>
        <button className="messageSendButton" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Messages;
