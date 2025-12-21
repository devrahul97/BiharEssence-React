import { useEffect, useState } from "react";

const useOnlineStatus = () => {

    // try to check the Internet connection

    console.log(navigator.onLine);
    const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

    useEffect(() => {
      window.addEventListener("offline", () => {
        console.log("offline");
        setOnlineStatus(false);
      });

      window.addEventListener("online", () => {
        console.log("Online");
        setOnlineStatus(true);
      });
    }, []);
    // boolean Value
    return onlineStatus;
}

export default useOnlineStatus;

