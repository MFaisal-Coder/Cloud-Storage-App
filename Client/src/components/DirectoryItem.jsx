import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../components/ContextMenu";
import { useDirectoryContext } from "../context/DirectoryContext";
import formatSize from '../utils/sizeFormatter.js'

function DirectoryItem({ item, uploadProgress }) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    getFileIcon,
    isUploading,
  } = useDirectoryContext();
  // Convert the file icon string to the actual Icon component
  function renderFileIcon(iconString) {
    switch (iconString) {
      case "pdf":
        return <FaFilePdf />;
      case "image":
        return <FaFileImage />;
      case "video":
        return <FaFileVideo />;
      case "archive":
        return <FaFileArchive />;
      case "code":
        return <FaFileCode />;
      case "alt":
      default:
        return <FaFileAlt />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");

  return (
    <div
      className="flex flex-col justify-between px-3 py-1 hover:bg-blue-100 border border-gray-300 hover:border-blue-500 rounded cursor-pointer relative"
      onClick={() =>
        !(activeContextMenu || isUploading)
          ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
          : null
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      <div className="flex justify-between" title={`Size: ${formatSize(item.size)}\nCreated At: ${new Date(item.createdAt).toLocaleString()}`}>
        <div className="flex items-center gap-2">
          {item.isDirectory ? (
            <FaFolder className="folder-icon" />
          ) : (
            renderFileIcon(getFileIcon(item.name))
          )}
          <span className="text-gray-800 truncate">{item.name}</span>
        </div>

        {/* Three dots for context menu */}
        <div
          className="text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-blue-200 p-2 rounded-full"
          onClick={(e) => handleContextMenu(e, item.id)}
        >
          <BsThreeDotsVertical />
        </div>
      </div>

      {/* PROGRESS BAR: shown if an item is in queue or actively uploading */}
      {isUploadingItem && (
        <div className="px-4 relative">
          <span
            className={`text-xs font-medium  ${uploadProgress > 50 ? "text-gray-200" : "text-gray-600"} text-right block absolute left-1/2 top-1/2 -translate-1/2`}
          >{Math.floor(uploadProgress)}%</span>
          <div className="w-full bg-gray-200 h-4 rounded">
          <div
            className="h-4 rounded"
            style={{
              width: `${uploadProgress}%`,
              backgroundColor: uploadProgress === 100 ? "#039203" : "#007bff",
            }}
          ></div>
          </div>
        </div>
      )}

      {/* Context menu, if active */}
      {activeContextMenu === item.id && (
        <ContextMenu
          item={item}
          isUploadingItem={isUploadingItem}/>
      )}
    </div>
  );
}

export default DirectoryItem;
