function Users() {
  const username = "testuser";
  return (
    <>
      <div className="users">
        <div className="user">
          <img src="https://static.thenounproject.com/png/2062361-200.png"></img>
          <p>{username}</p>
        </div>
      </div>
    </>
  );
}
export default Users;
