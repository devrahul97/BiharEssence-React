
import UserClass from "../components/UserClass"
import {Component} from "react";

// Some people write React.COmponent and some People just Write Componet and Destructure in the import
class About extends Component {

        constructor(props){
            super(props)

           // console.log(" parent constructor")  // 55: 00

        }

        componentDidCatch(){
            //console.log("parent componentDidCatch");
        }

        componentDidMount(){
          //  console.log("Parent Component Did mount");
        }

        componentDidUpdate(){
        //   console.log("Parent Component Did Update");
        }

        componentWillUnmount(){

        }

        

        render() {
           //  console.log(" parent render")
            return (
                 <div>
                    <h4>About</h4>
                    <h4>This is Namaste Web Series</h4>
                    {/* <User name= {"Rahul kumar (functional Component)"}/> */}
                    <UserClass name1 = {"First Component"} location={"Pune (class based component)"}/>
                    {/* <UserClass name1 = {"Second  Component "} location={"Pune (class based component)"}/>
                    <UserClass name1 = {"Third Component "} location={"Pune (class based component)"}/> */}
                    
                </div>
               
            )

             
        }
}

export default About;
// const About = () =>{

//     return (
//         <div>
//             <h4>About</h4>
//             <h4>This is Namaste Web Series</h4>
//             {/* <User name= {"Rahul kumar (functional Component)"}/> */}
//             <UserClass name1 = {"Rahul kumar (Class Based Component)"} location={"Pune (class based component)"}/>
//         </div>
//     )

// }
// export default About;

/* Life cycle of the Component
  -parent constructor
  -parent render
		-First  Child constructor
		-First  Child render
		-Second    Child constructor
		-Second    Child render
		-Third   Child constructor
		-Third   Child render
	-First Child Component Did mount
	-Second Child Component Did mount
	-Third Child Component Did mount
  -Parent Component Did mount
*/
