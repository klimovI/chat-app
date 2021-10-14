import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import queryString from 'query-string';

import './style.css';

const Join = ({ location }) => {
  const history = useHistory();
  const userNameInput = useRef(null);

  const join = async () => {
    const userName = userNameInput.current.value;
    if (userName) {
      localStorage.setItem('user', userName);
 
      const { chat } = queryString.parse(location.search);

      if (chat) {
        // Redirect to an existing chat
        history.push(`/chat/${chat}`);
      } else {
        // Get a new chat from the server and redirect to it
        const { data } = await axios.post('http://localhost:3001/chat');
        history.push(`/chat/${data}`);
      }
    } else alert('Enter your name');
  }

  return (
    <main>
      <div className="joinBlock">
        <h1 className="joinBlockTitle">
          Welcome
        </h1>
        <input
          className="joinBlockInput"
          ref={userNameInput}
          type="email"
          placeholder="Name"
          onKeyPress={({ key }) => key === 'Enter' && join()}
        />
        <button className="joinBlockButton" onClick={join}>
          Join
        </button>
      </div>
    </main>
  );
}

export default Join;
