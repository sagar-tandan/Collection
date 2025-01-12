import React, { useContext } from "react";
import { ThemeContext } from "../context/context";

const Random = () => {
  const { HotelData } = useContext(ThemeContext);
  console.log(HotelData);
  return <div>random</div>;
};

export default Random;
