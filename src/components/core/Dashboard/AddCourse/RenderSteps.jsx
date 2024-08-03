import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"

export default function RenderSteps() {
  const { step } = useSelector((state) => state.course)

  const steps = [
    {
      id: 1,
      title: "Course Information",
    },
    {
      id: 2,
      title: "Course Builder",
    },
    {
      id: 3,
      title: "Publish",
    },
  ]

  return (
    <>
      <div className="relative mb-4 flex w-full justify-center sm:mb-2">
        {steps.map((item) => (
          <div
            className="flex flex-col items-center"
            key={item.id}
          >
            <button
              className={`grid cursor-default aspect-square w-8 sm:w-10 place-items-center rounded-full border ${
                step === item.id
                  ? "border-yellow-50 bg-yellow-900 text-yellow-50"
                  : "border-richblack-700 bg-richblack-800 text-richblack-300"
              } ${step > item.id && "bg-yellow-50 text-yellow-50"}} `}
            >
              {step > item.id ? (
                <FaCheck className="text-lg sm:text-xl text-richblack-900" />
              ) : (
                item.id
              )}
            </button>
            {item.id !== steps.length && (
              <div
                className={`h-2 w-1/4 border-dashed border-b-2 ${
                  step > item.id ? "border-yellow-50" : "border-richblack-500"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="relative mb-8 flex w-full select-none justify-between sm:mb-6">
        {steps.map((item) => (
          <div
            className="flex min-w-[120px] flex-col items-center gap-y-2"
            key={item.id}
          >
            <p
              className={`text-xs sm:text-sm ${
                step >= item.id ? "text-richblack-5" : "text-richblack-500"
              }`}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>
      {/* Render specific component based on current step */}
      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  )
}
