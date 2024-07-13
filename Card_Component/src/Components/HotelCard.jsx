import React from "react";
import no from "../assets/no.png";
import yes from "../assets/yes.png";

const HotelCard = ({ props }) => {
  return (
    <div className="relative w-full flex flex-col bg-green-100  rounded-lg gap-1">
      <img className="w-full h-[200px] object-cover rounded-t-lg" src={props.img} alt="" />
      <div className="flex flex-col gap-1 px-[8px]">
        <h1 className="text-lg font-semibold">{props.name}</h1>
        <p> {props.desc?.slice(0, 170) + "..."}</p>
        <div className="w-full flex gap-2 mt-[6px] items-center">
          <img
            className="w-5 h-5"
            src={props.freeCancellation ? yes : no}
            alt=""
          />
          <h1 className="font-medium text-[17px]">{props.freeCancellation ? "Refundable" : "Non-refundable"}</h1>
        </div>
        <div className="w-full flex justify-between mt-2 pb-3 px-1">
          <h1 className="text-lg font-medium">Rs. {props.price}</h1>
          <button
            className={`${props.reserveNow ? "bg-green-600 hover:bg-green-700 transition-all ease-in-out duration-500" : "bg-red-600 hover:bg-red-700 transition-all ease-in-out duration-500"} px-2 py-1 rounded text-lg text-white font-medium`}
          >
            {props.reserveNow ? "Book Now" : "Not Available"}
          </button>
        </div>
        <h1 className="absolute top-0 right-0 bg-yellow-500 text-white px-3 font-medium text-lg rounded-tr-lg rounded-bl-lg">
          {props.rating}.0
        </h1>
      </div>
    </div>
  );
};

export default HotelCard;
