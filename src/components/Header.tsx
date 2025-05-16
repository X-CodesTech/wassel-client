import { Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Activity Management System</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, Admin</span>
          <button className="p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
