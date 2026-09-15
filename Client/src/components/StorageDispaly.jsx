import formatSize from "../utils/sizeFormatter.js";

export default function StorageDisplay({ availableSize, storage }) {
    const sizeForSlider = formatSize(availableSize).split(' ')[0]/ 12
    console.log(sizeForSlider)
  return (
    <>
      <div className="storage-container">
        {formatSize(availableSize)} /{formatSize(storage)}
        <div className="storage-slider-container">
            <div className="storage-slider" style={{width:`${sizeForSlider}px` , backgroundColor: "blue"}}></div>
        </div>
      </div>
    </>
  );
}
