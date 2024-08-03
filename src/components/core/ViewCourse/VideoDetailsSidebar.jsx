import { useEffect, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { IoIosArrowBack, IoMdArrowForward } from "react-icons/io";
import { BiCollapseHorizontal } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import IconBtn from "../../common/IconBtn";

export default function VideoDetailsSidebar({
  setReviewModal,
  onToggle,
  isCollapsed,
}) {
  const [activeStatus, setActiveStatus] = useState("");
  const [videoBarActive, setVideoBarActive] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { sectionId, subSectionId } = useParams();
  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);

  useEffect(() => {
    (() => {
      if (!courseSectionData.length) return;
      const currentSectionIndx = courseSectionData.findIndex(
        (data) => data._id === sectionId
      );
      const currentSubSectionIndx = courseSectionData?.[
        currentSectionIndx
      ]?.subSection.findIndex((data) => data._id === subSectionId);
      const activeSubSectionId =
        courseSectionData[currentSectionIndx]?.subSection?.[
          currentSubSectionIndx
        ]?._id;
      setActiveStatus(courseSectionData?.[currentSectionIndx]?._id);
      setVideoBarActive(activeSubSectionId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSectionData, courseEntireData, location.pathname]);

  return (
    <div
      className={`flex flex-col h-full transition-all ${isCollapsed ? "p-2" : "p-5"
        }`}
    >
      <div className={`flex items-center justify-between mb-4  gap-5 ${isCollapsed?"flex-col":"flex-row"}`}>
        <div
          onClick={() => navigate(`/dashboard/enrolled-courses`)}
          className="flex  h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90 cursor-pointer"
          title="Back"
        >
          <IoIosArrowBack size={24} />
        </div>
        <div
          onClick={onToggle}
          className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <BiCollapseHorizontal size={14} />
        </div>
      </div>
      {!isCollapsed && (
        <>
          <div className="flex  flex-col">
            <p className="text-sm text-richblack-5 sm:text-base">{courseEntireData?.courseName}</p>
            <p className="text-xs sm:text-sm font-semibold text-richblack-500">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
          <IconBtn
            text="Add Review"
            customClasses="ml-auto mt-4"
            onclick={() => setReviewModal(true)}
          />
        </>
      )}
      <div className="flex-1 overflow-y-auto mt-4">
        {courseSectionData.map((course, index) => (
          <div
            className="mt-2 cursor-pointer text-xs sm:text-sm text-richblack-5"
            onClick={() => setActiveStatus(course?._id)}
            key={index}
          >
            {/* Section */}
            <div className="flex flex-row justify-between bg-richblack-600 px-4 sm:px-5 py-3 sm:py-4">
              <div className={`w-[${isCollapsed ? "100%" : "70%"}] font-semibold`}>
                {course?.sectionName}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`${activeStatus === course?._id ? "rotate-0" : "rotate-180"
                      } transition-transform duration-500`}
                  >
                    <BsChevronDown size={16} />
                  </span>
                </div>
              )}
            </div>

            {/* Sub Sections */}
            {activeStatus === course?._id && !isCollapsed && (
              <div className="transition-[height] duration-500 ease-in-out">
                {course.subSection.map((topic, i) => (
                  <div
                    className={`flex gap-2 sm:gap-3 px-4 sm:px-5 py-2 ${videoBarActive === topic._id
                        ? "bg-yellow-200 font-semibold text-richblack-800"
                        : "hover:bg-richblack-900"
                      }`}
                    key={i}
                    onClick={() => {
                      navigate(
                        `/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`
                      );
                      setVideoBarActive(topic._id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={completedLectures.includes(topic?._id)}
                      onChange={() => { }}
                      className="h-4 w-4"
                    />
                    <span className="text-xs sm:text-sm">{topic.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
