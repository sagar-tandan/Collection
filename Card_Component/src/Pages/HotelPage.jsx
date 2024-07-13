import React, { useEffect, useState } from "react";
import HotelCard from "../Components/HotelCard";

const HotelPage = () => {
  const [HotelData, setHotelData] = useState([]);

  useEffect(() => {
    const getHotelData = async () => {
      const response = await fetch("http://localhost:3000/hotels");
      const data = await response.json();
      setHotelData(data);
    };
    getHotelData();
  }, []);
  return (
    // <div className="w-full max-w-screen-2xl flex flex-row gap-[23px] flex-wrap justify-start sm:pl-[18px] px-2 mt-3 mb-10 xl:mx-auto">
    <div className="w-full max-w-screen-2xl flex flex-row gap-[23px] flex-wrap justify-start pl-[18px] mt-3 mb-10 xl:mx-auto">
      {HotelData.map((data) => (
        // <div key={data.id} className="w-full sm:w-[48%] xl:w-[32%]">
        <div key={data.id} className="w-[32%]">
          <HotelCard props={data} />
        </div>
      ))}
    </div>
  );
};

export default HotelPage;
