import { useEffect } from "react";
import { useDirectoryContext } from "../context/DirectoryContext";

function ContextMenu({ item, isUploadingItem }) {
  const {
    handleCancelUpload,
    openRenameModal,
    BASE_URL,
    contextMenuPos,
    setDetails,
    setShowDetails,
    handleDeleteFile,
    handleDeleteDirectory,
  } = useDirectoryContext();

  useEffect(() => {
    setDetails(item);
  }, []);

  const menuClass =
    "absolute max-w-24 bg-white border border-blue-400 shadow-md right-2 top-4/5 rounded text-sm z-50 overflow-hidden";
  const itemClass = "px-4 py-2 hover:bg-blue-100 cursor-pointer";

  // Directory context menu
  if (item.isDirectory) {
    return (
      <div
        className={menuClass}
      >
        <div
          className={itemClass}
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          Rename
        </div>
        <div
          className={itemClass}
          onClick={() => handleDeleteDirectory(item.id)}
        >
          Delete
        </div>
        <div
          className={itemClass}
          onClick={() => setShowDetails((prev) => !prev)}
        >
          Details
        </div>
      </div>
    );
  } else {
    // File context menu
    if (isUploadingItem && item.isUploading) {
      // Only show "Cancel"
      return (
        <div
          className={menuClass}
        >
          <div
            className={itemClass}
            onClick={() => handleCancelUpload(item.id)}
          >
            Cancel
          </div>
        </div>
      );
    } else {
      // Normal file
      return (
        <div
          className={menuClass}
        >
          <div
            className={itemClass}
            onClick={() =>
              (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
            }
          >
            Download
          </div>
          <div
            className={itemClass}
            onClick={() => openRenameModal("file", item.id, item.name)}
          >
            Rename
          </div>
          <div className={itemClass} onClick={() => handleDeleteFile(item.id)}>
            Delete
          </div>
          <div
            className={itemClass}
            onClick={() => setShowDetails((prev) => !prev)}
          >
            Details
          </div>
        </div>
      );
    }
  }
}

export default ContextMenu;
