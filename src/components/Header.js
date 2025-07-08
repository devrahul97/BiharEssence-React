import { useState } from "react";
import {Link} from "react-router";
import useOnlineStatus from "../../utils/useOnlineStatus";

const Header = () => {

    const [btnNameReact, setbtnNameReact]  = useState("Login");
    const onlineStatus = useOnlineStatus();

    // useEffect(() => {
    //     console.log("useEffect Called.")
    // }, [])

    //let btnName = "Login";
    return (
        <div className="flex justify-between bg-pink-100 shadow-2xl">
            <div className="logo-container">
                <img  className="w-56"  img="/Assets/BiharEssence.jpeg" alt="Logo"/>
            </div>
            
            <div className="flex items-center">
                <ul className="flex p-2 m-4">
                    <li className="px-4"> Online Status: {onlineStatus ? "✅" : "🔴"}</li>
                    <li className="px-4"> <Link to="/">Home</Link></li>
                    <li className="px-4"><Link to="/about">About</Link></li>
                    <li className="px-4"> <Link to="/contact">Contact Us</Link></li>
                    <li className="px-4"> <Link to="/grocery">Grocery</Link></li>
                    <li className="px-4"><Link to="/cart"> Cart</Link></li>
                    <li className="px-4" onClick={() =>{
                        setbtnNameReact(btnNameReact => (btnNameReact =="Login" ? "Logout": "Login"))
                       // btnNameReact ==="Login" ?  setbtnNameReact("Logout") : setbtnNameReact("Login");
                    }}>{btnNameReact}</li>
                </ul>
            </div>

        </div>
    )
};
export default Header;  // standard practice