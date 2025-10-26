import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, User, LogOut, Settings, Search, Moon, Sun } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { dateHelpers } from "../../utils/dateHelpers";
import { clsx } from "clsx";

function Navbar({ onMenuClick, onToggleDarkMode, isDarkMode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const handleLogout = () => logout();
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsNotificationsOpen(false);
  };

  return (
    <nav className={clsx(
      "shadow-sm border-b transition-colors duration-300",
      isDarkMode
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Left section: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className={clsx(
                "lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-300",
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              )}
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MA</span>
              </div>
              <span className={clsx(
                "text-xl font-bold",
                isDarkMode ? "text-gray-100" : "text-gray-900"
              )}>
                MediCare Assist
              </span>
            </Link>
          </div>

          {/* Right section: Search + Icons */}
          <div className="flex items-center gap-4 md:gap-6">

            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={clsx("h-5 w-5", isDarkMode ? "text-gray-300" : "text-gray-400")} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className={clsx(
                    "block w-full pl-10 pr-3 py-2 border rounded-md leading-5 sm:text-sm transition-colors duration-300",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  )}
                />
              </div>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDarkMode}
              className={clsx(
                "p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300",
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              )}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={clsx(
                  "p-2 rounded-md relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                )}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className={clsx(
                  "absolute right-0 mt-2 w-80 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 transition-colors duration-300 overflow-hidden",
                  isDarkMode ? "bg-gray-700" : "bg-white"
                )}>
                  <div className="py-1">
                    <div className={clsx(
                      "px-4 py-2 flex justify-between items-center border-b",
                      isDarkMode ? "border-gray-600" : "border-gray-200"
                    )}>
                      <h3 className={clsx("text-sm font-medium", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button className="text-xs text-blue-600 hover:text-blue-500" onClick={markAllAsRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={clsx("px-4 py-3 text-sm text-center", isDarkMode ? "text-gray-300" : "text-gray-500")}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={clsx(
                              "px-4 py-3 cursor-pointer border-b transition-colors duration-200",
                              !notification.read ? (isDarkMode ? "bg-blue-900" : "bg-blue-50") : "",
                              isDarkMode ? "border-gray-600 hover:bg-gray-600" : "border-gray-100 hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className={clsx("text-sm font-medium", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                                  {notification.title}
                                </p>
                                <p className={clsx("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                  {notification.message}
                                </p>
                                <p className={clsx("text-xs mt-1", isDarkMode ? "text-gray-400" : "text-gray-400")}>
                                  {dateHelpers.getRelativeTime(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="ml-2 h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className={clsx("h-8 w-8 rounded-full flex items-center justify-center", isDarkMode ? "bg-gray-600" : "bg-gray-300")}>
                  <User className={clsx("h-5 w-5", isDarkMode ? "text-gray-100" : "text-gray-600")} />
                </div>
                <span className={clsx("ml-2 font-medium hidden md:block", isDarkMode ? "text-gray-200" : "text-gray-700")}>
                  {user?.firstName} {user?.lastName}
                </span>
              </button>

              {isProfileOpen && (
                <div className={clsx(
                  "absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 transition-colors duration-300 overflow-hidden",
                  isDarkMode ? "bg-gray-700" : "bg-white"
                )}>
                  <div className="py-1">
                    <div className={clsx("px-4 py-2 border-b", isDarkMode ? "border-gray-600" : "border-gray-200")}>
                      <p className={clsx("text-sm font-medium", isDarkMode ? "text-gray-100" : "text-gray-900")}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className={clsx("text-sm", isDarkMode ? "text-gray-300" : "text-gray-500")}>
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className={clsx(
                        "flex items-center px-4 py-2 text-sm transition-colors duration-200",
                        isDarkMode ? "text-gray-200 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <User className="h-4 w-4 mr-3" /> Profile
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className={clsx(
                        "flex items-center px-4 py-2 text-sm transition-colors duration-200",
                        isDarkMode ? "text-gray-200 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Settings className="h-4 w-4 mr-3" /> Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={clsx(
                        "flex items-center w-full px-4 py-2 text-sm transition-colors duration-200",
                        isDarkMode ? "text-gray-200 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <LogOut className="h-4 w-4 mr-3" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
