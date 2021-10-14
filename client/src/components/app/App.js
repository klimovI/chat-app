import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Chat from '../../pages/chat';
import Join from '../../pages/join';

const App = () => (
  <Switch>
    <Route path="/" exact component={Join} />
    <Route path="/chat/:chatID" exact component={Chat}/>
    <Redirect to="/" />
  </Switch>
);

export default App;
