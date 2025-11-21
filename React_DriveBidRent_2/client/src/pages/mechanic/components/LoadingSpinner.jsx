// client/src/pages/mechanic/components/LoadingSpinner.jsx   (create this file if you want a reusable one)

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto"></div>
        <p className="mt-8 text-xl font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}