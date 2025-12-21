import { useEffect } from "react";
import { MENU_API } from "./constants";


// This is custom Hook, which is used to fetch the data.
const userRestaurantMenu = (resId) =>{

    const [resInfo, setResInfo] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () =>{
        
        const data = await fetch(MENU_API+resId);
        const json = await data.json();
        setResInfo(json.data);

    }
    return resInfo ; 

}

export default userRestaurantMenu;