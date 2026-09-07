// client/src/pages/seller/components/VehicleImageFields.jsx
//
// The vehicle photo inputs shared by the Add Auction and Add Rental forms:
// one main cover photo, plus a separate set of side/additional photos.
// Keeping both forms on one implementation means the rules and the look
// stay in step.
import { useState, useRef, useEffect } from 'react';
import { MAX_FILE_SIZE, formatSize } from './vehicleImageRules';

// Main vehicle photo — exactly one image, shown as a preview tile.
export const MainImageUploadField = ({ file, onChange, label = 'Main Car Image' }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isOverLimit = file && file.size > MAX_FILE_SIZE;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="md:col-span-2">
      <label className="block font-semibold text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        One photo only — this is the cover image buyers see first.
      </p>
      <input
        ref={inputRef}
        type="file"
        name="mainImage"
        onChange={onChange}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full text-left border-2 border-dashed rounded-lg px-4 py-4 transition-colors ${
          file
            ? isOverLimit
              ? 'border-red-400 bg-red-50'
              : 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
        }`}
      >
        {file ? (
          <div className="flex items-center gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Main car preview"
                className="h-20 w-28 object-cover rounded-md border border-gray-200 flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className={`text-xs font-bold mt-0.5 ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                {formatSize(file.size)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Click to replace this photo</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-400 font-medium">Click to select the main car photo</p>
            <p className="text-xs text-gray-400 mt-1">A clear front or 3/4 shot of the whole car works best</p>
          </div>
        )}
      </button>
      {isOverLimit && (
        <p className="text-xs text-red-600 font-semibold mt-1">
          File exceeds the 10 MB limit. Please choose a smaller image.
        </p>
      )}
    </div>
  );
};

// Additional / side photos — between minCount and maxCount images.
export const AdditionalImagesUploadField = ({ files, onChange, minCount = 1, maxCount = 5 }) => {
  const inputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const hasFiles = files && files.length > 0;
  const isOverCount = files.length > maxCount;
  const isUnderCount = hasFiles && files.length < minCount;
  const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <div className="md:col-span-2">
      <label className="block font-semibold text-gray-700 mb-1">
        Additional Photos <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Side, rear and interior shots — minimum {minCount}, maximum {maxCount}.
      </p>
      <input
        ref={inputRef}
        type="file"
        name="additionalImages"
        onChange={onChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full text-left border-2 border-dashed rounded-lg px-4 py-4 transition-colors ${
          hasFiles
            ? isOverCount || isUnderCount || oversizedFiles.length > 0
              ? 'border-red-400 bg-red-50'
              : 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
        }`}
      >
        {hasFiles ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-800">
                {files.length} photo{files.length !== 1 ? 's' : ''} selected
              </span>
              <span className={`text-xs font-bold ${isOverCount ? 'text-red-600' : 'text-green-600'}`}>
                {files.length}/{maxCount} max
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, i) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Additional ${i + 1}`}
                    className={`h-16 w-20 object-cover rounded-md border ${
                      files[i].size > MAX_FILE_SIZE ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center rounded-b-md">
                    {formatSize(files[i].size)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: {formatSize(totalSize)} · Click to re-select photos
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-400 font-medium">Click to select additional photos</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload {minCount}–{maxCount} images (side, rear, interior, dashboard)
            </p>
          </div>
        )}
      </button>
      {isOverCount && (
        <p className="text-xs text-red-600 font-semibold mt-1">
          Too many photos! Maximum {maxCount} allowed. You selected {files.length}.
        </p>
      )}
      {isUnderCount && (
        <p className="text-xs text-red-600 font-semibold mt-1">
          At least {minCount} additional photo required.
        </p>
      )}
      {oversizedFiles.length > 0 && (
        <p className="text-xs text-red-600 font-semibold mt-1">
          {oversizedFiles.length} file(s) exceed the 10 MB limit.
        </p>
      )}
      {hasFiles && !isOverCount && !isUnderCount && oversizedFiles.length === 0 && (
        <p className="text-xs text-green-600 font-semibold mt-1">
          All files OK — {files.length} photo{files.length !== 1 ? 's' : ''} ready for upload
        </p>
      )}
    </div>
  );
};
