import React, { useEffect, useState } from "react";
import no from "../assets/no.png";
import yes from "../assets/yes.png";
const data = [
  {
    name: "Bahubali ",
    img: "https://th.bing.com/th/id/OIP.BI71lctTow3eGlLA0OTl4AHaK-?w=123&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    runtime: "2 hours 34 mins",
    timings: [],
    trailer: "",
  },

  {
    name: "Bahubali ",
    img: "https://th.bing.com/th/id/OIP.BI71lctTow3eGlLA0OTl4AHaK-?w=123&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    runtime: "2 hours 34 mins",
    timings: [],
    trailer: "",
  },

  {
    name: "Bahubali ",
    img: "https://th.bing.com/th/id/OIP.BI71lctTow3eGlLA0OTl4AHaK-?w=123&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    runtime: "2 hours 34 mins",
    timings: [],
    trailer: "",
  },
];

const HotelCard = () => {
  const [myData, setMyData] = useState();

  
  const fetchData = async () => {
    const response = await axios.get("url");
    const data = response.data();
    setMyData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full p-10 flex">
      <div className="w-full grid grid-cols-3 gap-10">
        {myData?.map((da) => (
          <div className="w-full flex flex-col ">
            <img
              className="w-full h-[350px] object-cover"
              src={da.img}
              alt=""
            />
            <h1>{da.name}</h1>
            <p>{da.runtime}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelCard;
