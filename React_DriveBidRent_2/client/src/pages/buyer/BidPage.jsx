// client/src/pages/buyer/BidPage.jsx
// Bidding now happens only inside the live auction room.
// This route used to render its own bid form; it redirects instead so
// an old link or a typed URL cannot be used to bid outside the room.
import { Navigate, useParams } from 'react-router-dom';

export default function BidPage() {
  const { id } = useParams();
  return <Navigate to={`/buyer/live-auction/${id}`} replace />;
}
