import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link, NavLink } from 'react-router-dom';
import { compareRolls, getUploads } from '../services/api';
import { Button } from '../components/ui/Button'
import {
  ChevronLeft, Home, TrendingUp, LayoutDashboard, Upload as UploadIcon,
  GitCompare, Activity, ArrowRight, ArrowLeft, ZoomIn, Plus, Trash2,
  Edit2, Filter, Clock, MapPin, User, Search, FileText, ChevronDown, AlertTriangle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import { IndiaMap } from '../components/IndiaMap';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

// Internal Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DiffViewer Crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-8 w-8" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>
            <p className="text-gray-600 mb-4">The application encountered an unexpected error while processing the data.</p>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64 mb-6">
              <code className="text-xs text-red-800 font-mono whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </code>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
              <Link to="/compare">
                <Button variant="outline">Back to Compare</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DiffViewer() {
  return (
    <ErrorBoundary>
      <DiffViewerContent />
    </ErrorBoundary>
  );
}

function DiffViewerContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState({ added: [], deleted: [], modified: [] });
  // ... (rest of state initialization remains same)
  const [comparisonStats, setComparisonStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Electoral Differences...');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState('All');
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Store file references for display
  const [oldFile, setOldFile] = useState(null);
  const [newFile, setNewFile] = useState(null);

  // Get uploads from navigation state or fetch from API
  const stateUploads = location.state?.uploads || [];

  // Check if comparison data was already passed from Compare page
  const stateComparison = location.state?.comparison;

  useEffect(() => {
    // If comparison data was passed from Compare page, use it directly
    if (stateComparison && stateUploads.length >= 2) {
      console.log('[DiffViewer] Using pre-fetched comparison data from Compare page');
      setUploads(stateUploads);

      // Sort uploads by date to determine old vs new
      const sortedUploads = [...stateUploads].sort((a, b) =>
        new Date(a.uploaded_at) - new Date(b.uploaded_at)
      );
      setOldFile(sortedUploads[0]);
      setNewFile(sortedUploads[1]);

      setComparisonData({
        added: stateComparison.added || [],
        deleted: stateComparison.deleted || [],
        modified: stateComparison.modified || []
      });
      setComparisonStats(stateComparison.stats);
      setLoading(false);
      return;
    }

    // Timeout controller for API calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    const fetchAndCompare = async () => {
      setLoading(true);
      setError(null);

      try {
        let uploadsToCompare = stateUploads;

        // If no uploads passed via navigation, fetch from API
        if (uploadsToCompare.length < 2) {
          console.log('[DiffViewer] No uploads in state, fetching from API...');
          setLoadingMessage('Connecting to server...');

          let apiUploads;
          try {
            // Add a race between the API call and a timeout
            const fetchPromise = getUploads();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Server is taking too long to respond. It may be starting up - please try again in 30 seconds.')), 25000)
            );
            apiUploads = await Promise.race([fetchPromise, timeoutPromise]);
          } catch (fetchErr) {
            console.error('[DiffViewer] Failed to fetch uploads:', fetchErr);
            const isTimeout = fetchErr.message.includes('taking too long') || fetchErr.message.includes('timeout');
            setError(isTimeout
              ? "Server is starting up. Please wait 30 seconds and try again, or upload files via the Compare page."
              : "Unable to fetch uploaded files. The database may not be initialized. Please upload files via the Compare page first.");
            setLoading(false);
            return;
          }

          if (!apiUploads || apiUploads.length < 2) {
            setError("No uploaded files found. Please upload at least two electoral rolls via the Compare page to compare.");
            setLoading(false);
            return;
          }

          // Use the two most recent uploads (sorted by uploaded_at desc)
          // apiUploads is already sorted by uploaded_at desc from the backend
          uploadsToCompare = apiUploads.slice(0, 2);
          console.log('[DiffViewer] Using uploads from API:', uploadsToCompare);
        }

        setUploads(uploadsToCompare);
        setLoadingMessage('Comparing files...');

        // Compare the files (older one first, newer one second)
        // Sort by uploaded_at to ensure correct order
        const sortedUploads = [...uploadsToCompare].sort((a, b) =>
          new Date(a.uploaded_at) - new Date(b.uploaded_at)
        );

        const oldFileData = sortedUploads[0];
        const newFileData = sortedUploads[1];

        // Store in state for UI display
        setOldFile(oldFileData);
        setNewFile(newFileData);

        console.log('[DiffViewer] Comparing:', oldFileData.filename, 'vs', newFileData.filename);

        // Add timeout for compare call as well
        const comparePromise = compareRolls(oldFileData.upload_id, newFileData.upload_id);
        const compareTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Comparison is taking too long. Please try again.')), 30000)
        );
        const result = await Promise.race([comparePromise, compareTimeoutPromise]);

        setComparisonData({
          added: result.added || [],
          deleted: result.deleted || [],
          modified: result.modified || []
        });
        setComparisonStats(result.stats);
        setLoading(false);
      } catch (err) {
        console.error('[DiffViewer] Error:', err);
        setError(err.message || "Failed to compare files. Please try again.");
        setLoading(false);
      }
    };

    fetchAndCompare();

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [stateUploads, stateComparison]);

  // Transform backend data into the flat structure expected by the UI
  // { date, constituencyId, constituencyName, changeType, count, riskLevel }
  const transformedData = useMemo(() => {
    const flatData = [];

    // Helper to process record list
    const processRecords = (records, type) => {
      if (!Array.isArray(records)) return;
      records.forEach(rec => {
        if (!rec) return;
        // Backend now returns 'constituency' field directly from CSV or address extraction
        // Defensive: Ensure constituency is a string (it might come as a number from some CSVs)
        const constituencyName = String(rec.constituency || "Unknown Division");
        // Create an ID from the name (e.g. "Municipal Ward 10" -> "municipal-ward-10")
        const constituencyId = constituencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Defensive: Check for valid date
        let dateStr = rec.registration_date;
        let testDate = new Date(dateStr);

        // Try parsing DD-MM-YYYY or DD/MM/YYYY if standard parsing fails
        if (isNaN(testDate.getTime()) && typeof dateStr === 'string') {
          const parts = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
          if (parts) {
            // Assume DD-MM-YYYY
            testDate = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
            dateStr = testDate.toISOString().split('T')[0];
          }
        } else if (!isNaN(testDate.getTime())) {
          dateStr = testDate.toISOString().split('T')[0];
        }

        if (isNaN(testDate.getTime())) {
          dateStr = '2025-01-01'; // Fallback for invalid dates
        }

        flatData.push({
          date: dateStr, // YYYY-MM-DD
          constituencyId,
          constituencyName,
          changeType: type,
          count: 1, // Individual record
          riskLevel: 'Low', // Will be recalculated based on volume aggregation
          // Include raw data for details view
          details: rec
        });
      });
    };

    if (comparisonData.added) processRecords(comparisonData.added, 'Addition');
    if (comparisonData.deleted) processRecords(comparisonData.deleted, 'Deletion');

    // Modification data structure is different: { voter_id, old: {}, new: {}, changes: {} }
    // We use new.registration_date for timeline placement
    if (comparisonData.modified && Array.isArray(comparisonData.modified)) {
      comparisonData.modified.forEach(mod => {
        if (!mod || !mod.new) return;
        const rec = mod.new;
        const constituencyName = String(rec.constituency || "Unknown Division");
        const constituencyId = constituencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Defensive: Check for valid date
        let dateStr = rec.registration_date;
        let testDate = new Date(dateStr);

        // Try parsing DD-MM-YYYY or DD/MM/YYYY if standard parsing fails
        if (isNaN(testDate.getTime()) && typeof dateStr === 'string') {
          const parts = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
          if (parts) {
            // Assume DD-MM-YYYY
            testDate = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
            dateStr = testDate.toISOString().split('T')[0];
          }
        } else if (!isNaN(testDate.getTime())) {
          dateStr = testDate.toISOString().split('T')[0];
        }

        if (isNaN(testDate.getTime())) {
          dateStr = '2025-01-01'; // Fallback for invalid dates
        }

        flatData.push({
          date: dateStr,
          constituencyId,
          constituencyName,
          changeType: 'Modification',
          count: 1,
          riskLevel: 'Medium', // Modifications are inherently worth checking
          details: mod
        });
      });
    }

    return flatData;
  }, [comparisonData]);

  // Calculate Date Ranges for Inputs
  const { minDateStr, maxDateStr } = useMemo(() => {
    if (transformedData.length === 0) return { minDateStr: '2020-01-01', maxDateStr: '2030-01-01' };
    const dates = transformedData.map(d => d.date).sort();
    return {
      minDateStr: dates[0],
      maxDateStr: dates[dates.length - 1]
    };
  }, [transformedData]);

  // Filter Logic
  const filteredData = useMemo(() => {
    let filtered = [...transformedData];

    if (changeType !== 'All') {
      filtered = filtered.filter(item => item.changeType === changeType);
    }

    if (startDate) {
      filtered = filtered.filter(item => item.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(item => item.date <= endDate);
    }

    return filtered;
  }, [transformedData, startDate, endDate, changeType]);


  // ---- AGGREGATION LOGIC (Reused from previous, updated dependencies) ----

  const summaryStats = useMemo(() => {
    // Aggregate from filteredData to make the UI dynamic based on real data
    const additions = filteredData.filter(d => d.changeType === 'Addition').reduce((sum, d) => sum + d.count, 0);
    const deletions = filteredData.filter(d => d.changeType === 'Deletion').reduce((sum, d) => sum + d.count, 0);
    const modifications = filteredData.filter(d => d.changeType === 'Modification').reduce((sum, d) => sum + d.count, 0);
    const total = additions + deletions + modifications;
    return { total, additions, deletions, modifications };
  }, [filteredData]);

  const timelineData = useMemo(() => {
    const dateMap = {};
    filteredData.forEach(item => {
      // Safe Date Check for Map Key
      if (!item.date || typeof item.date !== 'string') return;

      if (!dateMap[item.date]) {
        dateMap[item.date] = { Addition: 0, Deletion: 0, Modification: 0 };
      }
      if (dateMap[item.date][item.changeType] !== undefined) {
        dateMap[item.date][item.changeType] += item.count;
      }
    });

    const allDates = Object.keys(dateMap).sort();
    if (allDates.length === 0) return [];

    return allDates.map(date => {
      const data = dateMap[date];
      const changes = data.Addition + data.Deletion + data.Modification;
      let dominant = 'Addition';
      if (data.Deletion > data.Addition && data.Deletion > data.Modification) dominant = 'Deletion';
      else if (data.Modification > data.Addition) dominant = 'Modification';

      // Robust Date Formatting
      let label = date;
      try {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } catch (e) {
        console.warn('Date parsing error', date);
      }

      return {
        date: label,
        dateKey: date,
        changes,
        dominant,
        full: data
      };
    });
  }, [filteredData]);

  const heatmapData = useMemo(() => {
    const constituencyMap = {};

    // First pass: Aggregate counts per constituency
    filteredData.forEach(item => {
      if (!constituencyMap[item.constituencyId]) {
        constituencyMap[item.constituencyId] = {
          name: item.constituencyName,
          Addition: 0,
          Deletion: 0,
          Modification: 0,
          Total: 0
        };
      }
      constituencyMap[item.constituencyId][item.changeType] += item.count;
      constituencyMap[item.constituencyId].Total += item.count;
    });

    // Second pass: Calculate risk levels and format for UI
    return Object.keys(constituencyMap).map(regionId => {
      const data = constituencyMap[regionId];

      // Real risk calculation based on volume thresholds
      // These thresholds should be tuned based on expected data volume
      let riskLevel = 'Low';
      if (data.Total > 50) riskLevel = 'High';
      else if (data.Total > 10) riskLevel = 'Medium';

      return {
        region: regionId, // transformed ID
        fullName: data.name,
        changes: data.Total,
        risk: riskLevel,
        breakdown: {
          Addition: data.Addition,
          Deletion: data.Deletion,
          Modification: data.Modification
        }
      };
    });
  }, [filteredData]);

  // Sample data list (first 100 rows for table)
  const listData = useMemo(() => {
    return filteredData.slice(0, 100).map((item, idx) => ({
      id: item.details?.voter_id || `VTR-${idx}`,
      type: item.changeType,
      timestamp: item.date,
      constituencyName: item.constituencyName,
      risk: item.riskLevel
    }));
  }, [filteredData]);

  // ---- VISUALIZATION DERIVATIONS (UI ONLY) ----
  const pieData = useMemo(() => {
    if (!summaryStats) return [];
    return [
      { name: 'New Voters', value: summaryStats.additions, color: '#10B981' }, // Emerald
      { name: 'Deletions', value: summaryStats.deletions, color: '#F43F5E' },  // Rose
      { name: 'Modifications', value: summaryStats.modifications, color: '#F59E0B' } // Amber
    ].filter(d => d.value > 0);
  }, [summaryStats]);

  const insights = useMemo(() => {
    if (!summaryStats || !heatmapData) return [];

    const list = [];
    const total = summaryStats.total || 1;

    // Insight 1: Dominant Type
    if (summaryStats.additions > summaryStats.deletions && summaryStats.additions > summaryStats.modifications) {
      const pct = Math.round((summaryStats.additions / total) * 100);
      list.push({ title: "Growth Focused", text: `${pct}% of detected changes are new voter additions.`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" });
    } else if (summaryStats.deletions > summaryStats.additions) {
      const pct = Math.round((summaryStats.deletions / total) * 100);
      list.push({ title: "Cleanup Phase", text: `${pct}% of changes are deletions (voter removals).`, icon: Trash2, color: "text-rose-600", bg: "bg-rose-50" });
    } else {
      list.push({ title: "Update Heavy", text: "Modifications to existing records dominate this comparison.", icon: Edit2, color: "text-amber-600", bg: "bg-amber-50" });
    }

    // Insight 2: Concentration
    const highRiskRegions = heatmapData.filter(r => r.risk === 'High').length;
    if (highRiskRegions > 0) {
      list.push({ title: "High Impact Areas", text: `${highRiskRegions} constituencies show abnormal change velocity.`, icon: AlertTriangle, color: "text-indigo-600", bg: "bg-indigo-50" });
    } else {
      list.push({ title: "Distributed Changes", text: "Changes are spread evenly across constituencies.", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" });
    }

    // Insight 3: Volume
    if (total > 1000) {
      list.push({ title: "Major Update", text: "High variance detected between these two versions.", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" });
    } else {
      list.push({ title: "Routine Maintenance", text: "Change volume is within standard operating limits.", icon: FileText, color: "text-gray-600", bg: "bg-gray-50" });
    }

    return list;
  }, [summaryStats, heatmapData]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="fixed top-4 left-4 flex gap-2 z-50">
          <Button variant="secondary" size="sm" className="bg-white/90 shadow-sm hover:bg-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Link to="/">
            <Button variant="secondary" size="sm" className="bg-white/90 shadow-sm hover:bg-white">
              <Home className="h-4 w-4 mr-1" /> Home
            </Button>
          </Link>
        </div>
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">{loadingMessage}</p>
        <p className="text-gray-400 text-sm mt-1">{uploads.length > 0 ? `Comparing ${uploads.length} files` : 'Please wait...'}</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-gray-900 text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => navigate('/compare')}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm fixed h-full z-10 hidden md:flex">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <img src="/assets/matsetu-logo.png" alt="MatheSetu Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
            MatheSetu
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <UploadIcon className="h-4 w-4" /> Upload Rolls
          </NavLink>
          <NavLink to="/compare" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <GitCompare className="h-4 w-4" /> Compare Versions
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 shadow-sm">
            <Activity className="h-4 w-4" /> Change Analysis
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-md group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">Admin User</p>
              <p className="text-xs text-gray-500">ECI Official</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">MatheSetu Analysis</h2>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-gray-200 shadow-sm text-xs font-mono text-gray-600">
                  <FileText className="h-3 w-3 text-indigo-500" />
                  {oldFile?.filename || 'File A'}
                </span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-gray-200 shadow-sm text-xs font-mono text-gray-600">
                  <FileText className="h-3 w-3 text-emerald-500" />
                  {newFile?.filename || 'File B'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/compare')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm text-sm font-medium active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Selection
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Stats Grid - Premium Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ZoomIn className="h-20 w-20" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Total Changes</p>
                      <div className="group/tooltip relative">
                        <Info className="h-3.5 w-3.5 text-indigo-200 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900/90 backdrop-blur text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-20">
                          Aggregated differences detected between the two selected electoral rolls.
                        </div>
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold tracking-tight mb-1">{summaryStats.total}</h3>
                    <p className="text-indigo-200 text-xs flex items-center gap-1 font-medium bg-indigo-800/30 px-2 py-1 rounded w-fit">
                      <TrendingUp className="h-3 w-3" /> Analysis complete
                    </p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Plus className="h-20 w-20" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">New Voters</p>
                    <h3 className="text-4xl font-bold tracking-tight mb-1">+{summaryStats.additions}</h3>
                    <p className="text-emerald-100 text-xs font-medium bg-emerald-700/30 inline-block px-2 py-1 rounded">
                      {(summaryStats.additions / (summaryStats.total || 1) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-5 text-white shadow-lg shadow-rose-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trash2 className="h-20 w-20" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider mb-1">Deletions</p>
                    <h3 className="text-4xl font-bold tracking-tight mb-1">-{summaryStats.deletions}</h3>
                    <p className="text-rose-100 text-xs font-medium bg-rose-700/30 inline-block px-2 py-1 rounded">
                      {(summaryStats.deletions / (summaryStats.total || 1) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Edit2 className="h-20 w-20" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider mb-1">Modifications</p>
                    <h3 className="text-4xl font-bold tracking-tight mb-1">~{summaryStats.modifications}</h3>
                    <p className="text-amber-100 text-xs font-medium bg-amber-700/30 inline-block px-2 py-1 rounded">
                      {(summaryStats.modifications / (summaryStats.total || 1) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Filters Section */}
              <Card className="shadow-sm border-0 ring-1 ring-gray-200/50 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-semibold text-gray-800 text-sm">Filter Results</h3>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500 italic">
                      filters apply instantly
                    </span>
                    <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-sm font-medium">
                      {filteredData.length} records found
                    </span>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={minDateStr}
                      max={maxDateStr}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={minDateStr}
                      max={maxDateStr}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Type</label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none bg-white text-sm"
                        value={changeType}
                        onChange={(e) => setChangeType(e.target.value)}
                      >
                        <option value="All">All Changes</option>
                        <option value="Addition">Additions Only</option>
                        <option value="Deletion">Deletions Only</option>
                        <option value="Modification">Modifications Only</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Charts Section */}
              {/* Charts Section - Stacked Layout */}
              <div className="flex flex-col gap-6">
                {/* Timeline Chart */}
                {/* Insight Cards (judges need this context) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className={`p-4 rounded-xl border border-gray-100 flex items-start gap-4 shadow-sm ${insight.bg}`}
                    >
                      <div className={`p-2 rounded-lg bg-white/60 shadow-sm ${insight.color}`}>
                        <insight.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${insight.color}`}>{insight.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{insight.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Advanced Analytical Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* 1. Change Composition (Donut) */}
                  <Card className="shadow-sm border-0 ring-1 ring-gray-200/50 bg-white flex flex-col min-h-[320px]">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-indigo-500" /> Change Composition
                      </h3>
                      <p className="text-xs text-gray-500">Distribution of detected difference types</p>
                    </div>
                    <div className="p-4 flex-1 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Centered Total */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-900 block">{summaryStats.total}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Changes</span>
                      </div>
                    </div>
                  </Card>

                  {/* 2. Change Velocity (Area Chart) */}
                  <Card className="shadow-sm border-0 ring-1 ring-gray-200/50 bg-white flex flex-col min-h-[320px]">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-indigo-500" /> Change Velocity
                      </h3>
                      <p className="text-xs text-gray-500">Temporal pattern of modifications between roll versions</p>
                    </div>
                    <div className="p-4 flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="changes" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorChanges)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* 3. Change Type Distribution (Stacked Bar) - New Section */}
                <Card className="shadow-sm border-0 ring-1 ring-gray-200/50 bg-white flex flex-col min-h-[300px]">
                  <div className="px-6 py-4 border-b border-gray-100 mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-indigo-500" /> Change Type Distribution
                    </h3>
                    <p className="text-xs text-gray-500">Breakdown of specific changes over the timeline</p>
                  </div>
                  <div className="px-6 pb-6 flex-1">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={timelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="full.Addition" name="Additions" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="full.Modification" name="Modifications" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="full.Deletion" name="Deletions" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Heatmap Section */}
                <Card className="shadow-sm border-0 ring-1 ring-gray-200/50 bg-white flex flex-col min-h-[420px]">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-indigo-500" /> Constituency Heatmap
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="group/map-info relative">
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-gray-900/90 backdrop-blur text-white text-[10px] rounded shadow-lg opacity-0 group-hover/map-info:opacity-100 pointer-events-none transition-opacity z-20">
                          Map positions are representative of constituency regions, not exact geographic coordinates.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {heatmapData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 relative min-h-[300px]">
                        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                          <IndiaMap className="h-full w-full max-h-[250px]" />
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 z-10">
                          <AlertTriangle className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm z-10">No constituency data available</p>
                      </div>
                    ) : (
                      <div className="relative min-h-[300px]">
                        {/* Subtle Map Background */}
                        <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center pointer-events-none">
                          <IndiaMap className="h-full w-full max-h-[280px]" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 relative z-10">
                          {heatmapData.map((region) => (
                            <motion.div
                              key={region.region}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedConstituency(region)}
                              className={`
                                  p-3 rounded-lg text-center border cursor-pointer transition-all relative overflow-hidden group bg-white/90 backdrop-blur-sm
                                  ${region.risk === 'High' ? 'border-rose-200 hover:border-rose-400 shadow-sm hover:shadow-md animate-pulse' :
                                  region.risk === 'Medium' ? 'border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-md' :
                                    'border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md'}
                                  `}
                            >
                              {/* Stat Indicator Bar */}
                              <div className={`absolute top-0 left-0 w-1 h-full
                                    ${region.risk === 'High' ? 'bg-rose-500' :
                                  region.risk === 'Medium' ? 'bg-amber-500' :
                                    'bg-emerald-500'}
                                `}></div>

                              <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-6 -mt-6 pointer-events-none`}></div>

                              <h4 className={`text-xs font-bold truncate mb-1 pl-2
                                  ${region.risk === 'High' ? 'text-rose-700' :
                                  region.risk === 'Medium' ? 'text-amber-700' :
                                    'text-emerald-700'}
                                  `}>{region.fullName}</h4>

                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide pl-2">{region.changes} Changes</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                    <span className="font-medium">Intensity Scale</span>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500"></div> Low</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-amber-500"></div> Medium</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500"></div> High</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Data Table */}
              <Card className="shadow-sm border-0 ring-1 ring-gray-200/50 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-semibold text-gray-800 text-sm">Detailed Change Log</h3>
                  </div>
                  <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-1 rounded shadow-sm">
                    top 100
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold tracking-wider bg-gray-50 sticky top-0 z-10">Voter ID</th>
                        <th className="px-6 py-3 font-semibold tracking-wider bg-gray-50 sticky top-0 z-10">Constituency</th>
                        <th className="px-6 py-3 font-semibold tracking-wider bg-gray-50 sticky top-0 z-10">Type</th>
                        <th className="px-6 py-3 font-semibold tracking-wider bg-gray-50 sticky top-0 z-10">Date</th>
                        <th className="px-6 py-3 font-semibold tracking-wider bg-gray-50 sticky top-0 z-10">Risk Status</th>
                        <th className="px-6 py-3 font-semibold tracking-wider text-right bg-gray-50 sticky top-0 z-10">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {listData.map((item, idx) => (
                        <tr key={idx} className="bg-white hover:bg-indigo-50/30 even:bg-gray-50/50 transition-colors group border-b border-gray-100 last:border-0 relative">
                          <td className="px-6 py-3 font-medium text-gray-900 font-mono text-xs">{item.id}</td>
                          <td className="px-6 py-3 text-gray-600 text-xs">{item.constituencyName || item.constituency}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border
                                ${item.type === 'Addition' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                item.type === 'Deletion' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                  'bg-amber-50 text-amber-700 border-amber-100'}
                              `}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-500 text-xs">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.risk === 'High' ? 'bg-rose-500' :
                                item.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}></div>
                              <span className={`text-xs font-medium ${item.risk === 'High' ? 'text-rose-700' :
                                item.risk === 'Medium' ? 'text-amber-700' : 'text-emerald-700'
                                }`}>{item.risk}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {listData.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                      <Search className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">No records found matching current filters</p>
                    </div>
                  )}
                </div>
              </Card>

            </motion.div>
          </AnimatePresence>

          {/* Selected Constituency Modal */}
          <AnimatePresence>
            {selectedConstituency && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedConstituency(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-xl p-0 max-w-sm w-full shadow-2xl overflow-hidden ring-1 ring-gray-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className={`p-4 text-white bg-gradient-to-r ${selectedConstituency.risk === 'High' ? 'from-rose-500 to-rose-600' :
                    selectedConstituency.risk === 'Medium' ? 'from-amber-500 to-amber-600' :
                      'from-emerald-500 to-emerald-600'
                    }`}>
                    <h3 className="text-lg font-bold">{selectedConstituency.fullName}</h3>
                    <p className="text-white/80 text-xs font-mono opacity-80">{selectedConstituency.region}</p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-600 text-sm">Total Changes</span>
                      <span className="font-bold text-gray-900 text-xl">{selectedConstituency.changes}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="text-emerald-600 font-bold text-xl">+{selectedConstituency.breakdown.Addition}</div>
                        <div className="text-emerald-800 text-[10px] font-bold uppercase tracking-wide mt-1">Added</div>
                      </div>
                      <div className="text-center p-3 bg-rose-50 rounded-lg border border-rose-100">
                        <div className="text-rose-600 font-bold text-xl">-{selectedConstituency.breakdown.Deletion}</div>
                        <div className="text-rose-800 text-[10px] font-bold uppercase tracking-wide mt-1">Deleted</div>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="text-amber-600 font-bold text-xl">~{selectedConstituency.breakdown.Modification}</div>
                        <div className="text-amber-800 text-[10px] font-bold uppercase tracking-wide mt-1">Modified</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setSelectedConstituency(null)}>Close Details</Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}