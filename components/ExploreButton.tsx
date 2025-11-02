"use client";

import Image from "next/image";

const ExploreButton = () => {
  return (
    <button
      className="mt-7 mx-auto"
      type="button"
      id="explore-btn"
      onClick={() => console.log("Explore Events clicked")}
    >
      Explore Events
      <Image
        src="/icons/arrow-down.svg"
        alt="Arrow down"
        width={24}
        height={24}
      />
    </button>
  );
};

export default ExploreButton;
