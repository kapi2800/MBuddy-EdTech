import React, { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import { HiOutlineVideoCamera } from "react-icons/hi"

function CourseSubSectionAccordion({ subSec }) {
  return (
    <div className="flex justify-between py-2 text-sm md:text-base">
      <div className="flex items-center gap-2">
        <span>
          <HiOutlineVideoCamera />
        </span>
        <p>{subSec?.title}</p>
      </div>
    </div>
  );
}

export default CourseSubSectionAccordion