import React, { createContext, useState } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [HotelData, setHotelData] = useState([]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, HotelData, setHotelData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };

// import React,{createContext, useState} from "react";

// const allContext = createContext();

// const ContextProvider = ({children})=>{
//   const [data,setData] = useState([]);
//    return (
//     <allContext.Provider value = {{data,setData}}>
//       {children}
//     </allContext.Provider>
//    )

// }
// export default ContextProvider;
