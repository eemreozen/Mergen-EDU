import { Navigate, useLocation } from 'react-router-dom'
export function RoadmapPage() { const location = useLocation(); return <Navigate to={`/learn${location.search}`} state={location.state} replace /> }
