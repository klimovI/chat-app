import { useHistory } from 'react-router-dom';

import socket from '../../socket';

import './style.css';

const Chats = ({chatID, chats}) => {
  const history = useHistory();

  const changeChat = id => {
    socket.emit('leave');
    history.push(`/chat/${id}`)
  };

  return (
    <div className="chats">
      <h1 className="chatsTitle">Chats</h1>
      <div className="chatsList">
        {chats.map(({ _id, name }, i) => (
          <div
            key={i}
            className={`chat ${_id === chatID && 'highlight'}` }
            onClick={() => changeChat(_id)}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chats;
