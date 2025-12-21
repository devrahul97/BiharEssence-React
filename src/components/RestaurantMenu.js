import Shimmer from "./Shimmer";
import {useParams} from "react-router";

const RestaurantMenu = () =>{

    const {resId}= useParams();

    resInfo = userRestaurantMenu(resId);

    if(resInfo === null){
        return <Shimmer/>
    }

    const {name,cuisines ,costForTwoMessage, avgRating} = resInfo?.cards[2].card?.card?.info;
    const {itemCards} = resInfo?.cards[4]?.groupedCard?.cardGroupMap?.REGULAR?.cards[2]?.card?.card;
 
    return  (

        <div className="menu">
           
        <h1>{name}</h1>
        <h3>{cuisines.join(",")} - {costForTwoMessage}</h3>
        <h3>{cuisines.join(",")}</h3>
        <h3>{avgRating} Stars</h3>
        <h1>{itemCards[0]?.card?.info?.category}</h1>
        <ul>
            {itemCards.map( (item) => <li key={item?.card?.info?.id}>{item.card.info.name} - Rs. <b>{ item?.card?.info?.price/100}</b></li>)}
            
        </ul>
            
        </div>
    )
}

export default RestaurantMenu;