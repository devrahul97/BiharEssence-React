const products = [
  { title: 'Cabbage', isFruit: false, id: 1 },
  { title: 'Garlic', isFruit: false, id: 2 },
  { title: 'Apple', isFruit: true, id: 3 },
];

const ShopingList = () => {

    const itemList = products.map(product => 
        <li>
            key = {product.id}
            {product.title}
        </li>
    )
    return (
        <ul>{itemList}</ul>
    );
}

 export default ShopingList;