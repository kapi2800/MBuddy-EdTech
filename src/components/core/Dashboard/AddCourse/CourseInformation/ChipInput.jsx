import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

export default function ChipInput({
  name,
  label,
  register,
  setValue,
  errors,
  values = [],
}) {
  const [inputValue, setInputValue] = useState("")
  const [chips, setChips] = useState(values)

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setChips((prevChips) => [...prevChips, inputValue.trim()])
      setInputValue("")
    }
  }

  const handleDeleteChip = (index) => {
    setChips((prevChips) => prevChips.filter((_, i) => i !== index))
  }

  useEffect(() => {
    register(name, { required: true })
  }, [register])

  useEffect(() => {
    setValue(name, chips)
  }, [chips, setValue])

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-wrap items-center gap-2 border-2 border-richblack-700 p-2 rounded-md bg-richblack-800">
        {chips.map((chip, index) => (
          <div
            key={index}
            className="flex items-center bg-yellow-900 text-yellow-50 px-2 py-1 rounded-full"
          >
            <span className="text-sm">{chip}</span>
            <button
              type="button"
              onClick={() => handleDeleteChip(index)}
              className="ml-2 text-lg"
            >
              <MdClose />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none text-richblack-50 placeholder-richblack-500"
          placeholder="Type and press Enter..."
        />
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
