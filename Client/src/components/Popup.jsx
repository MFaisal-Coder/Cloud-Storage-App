import { useEffect } from "react";
import { BASE_URL } from "../DirectoryView";
import "../Popup.css";

export default function Popup({
  popupRef,
  message,
  data,
  userID,
  setShowPopup,
  showPopup,
}) {
  useEffect(() => {
    // we'll retrun early if the popup is clsoed and wont attach the events unnecessarily
    if (!showPopup) return;

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const logoutUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.message) {
        setShowPopup(false);
        window.location.reload()  // not a good way but just to try
      }
    } catch (error) {
      console.error("Error logging the user out:", error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.message) {
        setShowPopup(false);
        window.location.reload()  // not a good way but just to try
      }
    } catch (err) {
      console.error("Error deleting user info:", err);
    }
  };
  return (
    <>
      <div className="popup-container" ref={popupRef}>
        {message}, {data}
        <div className="popup-cross" onClick={() => setShowPopup(false)}>
          &times;
        </div>
        <div className="popup-container__button-container">
          <button
            className="button-1"
            onClick={() => {
              message.includes("logout")
                ? logoutUser(userID)
                : deleteUser(userID);
            }}
          >
            Yes
          </button>
          <button className="button-2" onClick={() => setShowPopup(false)}>
            No
          </button>
        </div>
      </div>
    </>
  );
}
