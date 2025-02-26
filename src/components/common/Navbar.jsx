import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineShoppingCart, AiOutlineClose } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";

import logo from "../../assets/Logo/logo.jpg";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropDown";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    })();
  }, []);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBackgroundClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div
        className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
          location.pathname !== "/" ? "bg-richblack-800" : ""
        } transition-all duration-200`}
      >
        <div className="flex w-11/12 max-w-maxContent items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Logo" width={60} height={32} loading="lazy" className="rounded-full bg-[#6c6868] p-1" />
          </Link>
          {/* Navigation links */}
          <nav className="hidden md:block">
            <ul className="flex gap-x-6 text-white">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <>
                      <div
                        className={`group relative flex cursor-pointer items-center gap-1 ${
                          matchRoute("/catalog/:catalogName")
                            ? "text-yellow-25"
                            : "text-white"
                        }`}
                      >
                        <p>{link.title}</p>
                        <BsChevronDown />
                        <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                          <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                          {loading ? (
                            <p className="text-center">Loading...</p>
                          ) : subLinks && subLinks.length ? (
                            <>
                              {subLinks
                                ?.filter(
                                  (subLink) => subLink?.courses?.length > 0
                                )
                                ?.map((subLink, i) => (
                                  <Link
                                    to={`/catalog/${subLink.name
                                      .split(" ")
                                      .join("-")
                                      .toLowerCase()}`}
                                    className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                    key={i}
                                  >
                                    <p>{subLink.name}</p>
                                  </Link>
                                ))}
                            </>
                          ) : (
                            <p className="text-center">No Courses Found</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link to={link?.path}>
                      <p
                        className={`${
                          matchRoute(link?.path)
                            ? "text-yellow-25"
                            : "text-white"
                        }`}
                      >
                        {link.title}
                      </p>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          {/* Login / Signup / Dashboard */}
          <div className="hidden items-center gap-x-4 md:flex">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-white" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token === null && (
              <Link to="/login">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-white">
                  Log in
                </button>
              </Link>
            )}
            {token === null && (
              <Link to="/signup">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-white">
                  Sign up
                </button>
              </Link>
            )}
            {token !== null && <ProfileDropdown closeMenu={null}/>}
          </div>
          <button
            className="mr-4 md:hidden"
            onClick={handleMenuToggle}
          >
            {isMenuOpen ? (
              <AiOutlineClose fontSize={24} fill="#FFFFFF" />
            ) : (
              <AiOutlineMenu fontSize={24} fill="#FFFFFF" />
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleBackgroundClick}></div>
          <div className="fixed top-0 left-0 w-full bg-richblack-800 z-50 p-4">
            <div className="flex justify-between items-center">
              <Link to="/" onClick={handleMenuToggle}>
                <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
              </Link>
              <button onClick={handleMenuToggle}>
                <AiOutlineClose fontSize={24} fill="#FFFFFF" />
              </button>
            </div>
            <ul className="flex flex-col items-center gap-y-4 py-4 text-white">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <div className="relative flex flex-col items-center gap-1">
                      <p className="flex items-center gap-1">
                        {link.title}
                        <BsChevronDown />
                      </p>
                      <div className="flex flex-col items-center w-full bg-richblack-5 p-4 text-richblack-900">
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks && subLinks.length ? (
                          <>
                            {subLinks
                              ?.filter((subLink) => subLink?.courses?.length > 0)
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-2 hover:bg-richblack-50 w-full text-center"
                                  key={i}
                                  onClick={handleMenuToggle}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link to={link?.path} onClick={handleMenuToggle}>
                      <p className="text-center">{link.title}</p>
                    </Link>
                  )}
                </li>
              ))}
              {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link to="/dashboard/cart" onClick={handleMenuToggle}  className="relative">
                  <AiOutlineShoppingCart  className="text-2xl text-white" />
                  {totalItems > 0 && (
                    <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              {token === null && (
                <>
                  <Link to="/login">
                    <button
                      className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-white"
                      onClick={handleMenuToggle}
                    >
                      Log in
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button
                      className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-white"
                      onClick={handleMenuToggle}
                    >
                      Sign up
                    </button>
                  </Link>
                </>
              )}
              {token !== null && <ProfileDropdown closeMenu={handleMenuToggle} />}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
