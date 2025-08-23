import React from "react";

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 h-screen shadow-md p-4">
      <ul className="space-y-4">
        <li className="font-medium hover:text-indigo-600 cursor-pointer">
          Dashboard
        </li>
        <li className="font-medium hover:text-indigo-600 cursor-pointer">
          Portfolio
        </li>
        <li className="font-medium hover:text-indigo-600 cursor-pointer">
          Results
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
