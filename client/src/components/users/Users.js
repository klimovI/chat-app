import './style.css';

const Users = ({ users }) => (
  <div className="users">
    <h1 className="usersTitle">Users</h1>          
    {users.map((user, i) => (
      <div key={i} className="user">{user}</div>
    ))}
  </div>
);

export default Users;
