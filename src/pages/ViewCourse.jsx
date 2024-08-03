import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    ;(async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      dispatch(setEntireCourseData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length
      })
      dispatch(setTotalNoOfLectures(lectures))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token, dispatch])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <div
          className={`fixed top-30 left-0 h-full bg-richblack-800 transition-transform duration-300 ${
            sidebarCollapsed ? "w-16" : "w-full md:w-80"
          }`}
          style={{ zIndex: 1000 }}
        >
          <VideoDetailsSidebar
            setReviewModal={setReviewModal}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
            isCollapsed={sidebarCollapsed}
          />
        </div>
        <div
          className={`flex-1 transition-transform duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-0"
          }`}
        >
          <div className="h-[calc(100vh-3.5rem)] overflow-auto">
            <div className="mx-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}
