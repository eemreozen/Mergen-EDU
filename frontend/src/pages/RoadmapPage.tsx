import { Navigate, useLocation } from 'react-router-dom'
export function RoadmapPage() { const location = useLocation(); return <Navigate to="/learn" state={location.state} replace /> }
