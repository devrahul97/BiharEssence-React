# BiharEssence-React
Creating production Ready Project for BiharEssence

# parcel

-> Dev Build
-> Local Server
-> Auto Refresh -> HMR -> Hot module Replcement
-> File watcher Algorithm -> written in C++  -> Based on events and metadata from these files, Parcel determines which files need to be rebuilt.
-> Caching -> Faster Builds -> If you restart the dev server, Parcel will only rebuild files that have changed since the last time it ran
-> Image Optimization
-> Minification of our file
-> Bundling
-> compress
-> consistent Hashing 
->  code spliting
-> Differential Bundlig - to support older Browser.
-> Diagnostic
-> Error Handling
-> Https
-> Tree Shaking -> remove unused code for you

-> Read docs: https://parceljs.org

-> Different Build for Dev and Production bundles

Question =>
How to create a prod builds??
command: npx parcel build index.html -> go to dist folder and see 3 files will gbe generated js, html, css

browserlist.dev


----------
npm init -y — What It Does ??

initializes a new Node.js project. -y -> "means yes to all"
The "-y" flag stands for "yes to all". It automatically answers all the prompts that npm init would normally ask

Parcel has a development server built in, which will automatically rebuild your app as you make changes.
As you make changes, you should see your app automatically update in the browser without even refreshing the page!


lossless image optimization for JPEGs and PNGs -> which reduces the size of images without affecting their quality

# BiharEssence

/**
 * Header
 *  -Logo
 *  -Nav items
 * 
 * Body
 *  -Search
 *  -RestaurantContainer
 *    -RestaurantCard
 *      -img
 *      - Name of Restaurant, Start Rating, Cuisine, Delivery time
 
 * Footer
    - Copyright
    - Links
    - Address
    - Contact
 *  

*/



# Redux Toolkit
   - Redux @reduxjs/toolkit and react-redux
   - Build our Store
   - Connect our store to our App.
   - Slice (Cart Slice)
   - dispatch Actions
   - Selector.

   npm install @reduxjs/toolkit
   npm i react-redux
   
