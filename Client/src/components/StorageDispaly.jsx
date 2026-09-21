import formatSize from "../utils/sizeFormatter.js";

export default function StorageDisplay({ availableSize, storage }) {
  return (
    <>
      <div className="storage-container">
        <div className="flex flex-col text-xs mr-2 mt-2">
          <div className="w-40 h-1 bg-gray-300 rounded-full overflow-hidden mb-1">
            <div
              className="bg-blue-500 rounded-full h-full"
              style={{ width: `${(storage / availableSize) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs">
            {storage.toFixed(2)} GB of {availableSize} GB used
          </div>
        </div>
      </div>
    </>
  );
}
