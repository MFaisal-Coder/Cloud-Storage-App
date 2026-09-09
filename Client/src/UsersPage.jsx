import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "./DirectoryView";
import "./UsersPage.css";
import { useNavigate } from "react-router-dom";
import Popup from "./components/PopUp";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [popupUsername, setPopupUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("")
  const [userID, setUserID] = useState("")
  const popupRef = useRef()
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 403) {
        navigate("/");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  async function fetchUser() {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email);
        setUserName(data.name);
        setUserRole(data.role);
      } else {
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  // const logoutUser = async (userId) => {
  //   // alert(`Logging out user with ID: ${userId}`);
  //   try {
  //     const response = await fetch(`${BASE_URL}/users/${userId}/logout`, {
  //       method: "POST",
  //       credentials: "include",
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //     // setPopupMsg("")
  //     // setShowPopup(false)
  //   } catch (error) {
  //     console.error("Error logging the user out:", err);
  //   }
  // };

  // const deleteUser = async (userId) => {
  //   /* const confirmation = confirm(
  //     `Are you sure you want to delete user with ID: ${userId}?`,
  //   );
  //   if (!confirmation) return; */
  //   try {
  //     const response = await fetch(`${BASE_URL}/users/${userId}`, {
  //       method: "DELETE",
  //       credentials: "include",
  //     });
  //     const data = await response.json();
  //     // console.log(data)
  //     fetchUsers();
  //     // setPopupMsg("")
  //     // setShowPopup(false)
  //   } catch (err) {
  //     console.error("Error deleting user info:", err);
  //   }
  // };

  return (
    <>
    {/* Added custom PopUp rather than alerts and confirm prompts */}
      {showPopup && (
        <Popup
          popupRef={popupRef}
          message={`Are you sure you want to ${popupMsg} `}
          data={popupUsername}
          userID={userID}
          setShowPopup={setShowPopup}
          showPopup={showPopup}
        />
      )}
      <div className="users-container">
        <h1 className="title">All Users</h1>
        <p>
          {userName} <span style={{ fontStyle: "italic" }}>({userRole})</span>
        </p>
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              {userRole !== "User" && (
                <>
                  <th></th>
                  {userRole === "Admin" && <th></th>}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
                {userRole !== "User" && (
                  <>
                    <td>
                      <button
                        className="logout-button"
                        onClick={() => {
                          (setUserID(user.id), setShowPopup(true),setPopupUsername(user.name), setPopupMsg('logout'));
                        }}
                        disabled={!user.isLoggedIn}
                      >
                        Logout
                      </button>
                    </td>
                    {userRole === "Admin" && (
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => {
                            (setUserID(user.id) ,setShowPopup(true),setPopupUsername(user.name), setPopupMsg('delete'));
                          }}
                          disabled={userEmail === user.email}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
