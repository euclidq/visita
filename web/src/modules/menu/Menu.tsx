import Header from "../../shared/components/Header";
import { ClipboardPen, FileSearch } from "lucide-react";

const Menu = () => {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="container flex flex-1 flex-col max-w-2xl gap-4 justify-center">
        <button
          id="visitor-registration"
          className="flex items-center justify-center gap-2 rounded-md px-2 py-4 text-white bg-blue-500 hover:bg-blue-600"
          onClick={() => {
            window.location.href = "/visitor-registration";
          }}>
          <ClipboardPen size={42} />
          <h3>Visitor Registration</h3>
        </button>
        <button
          id="track-registration"
          className="flex items-center justify-center gap-2 rounded-md px-2 py-4 text-white bg-blue-500 hover:bg-blue-600"
          onClick={() => {
            window.location.href = "/track-registration";
          }}>
          <FileSearch size={42} />
          <h3>Track Registration</h3>
        </button>
      </div>
    </div>
  )
};

export default Menu;
