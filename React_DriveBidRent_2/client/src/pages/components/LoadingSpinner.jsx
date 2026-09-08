// client/src/pages/components/LoadingSpinner.jsx
//
// Route-level loading indicator. Thin wrapper over the shared BrandLoader so
// every waiting state in the app uses the same road-and-car motif instead of a
// generic ring.
import BrandLoader from '../../components/BrandLoader';

const LoadingSpinner = ({ label }) => <BrandLoader variant="inline" label={label} />;

export default LoadingSpinner;
