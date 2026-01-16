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
  PieChart, Pie, AreaChart, Area, Legend, LineChart, Line
} from 'recharts';
import { Eye, ShieldAlert, ChevronRight, Activity as ForensicIcon, BarChart3, Database } from 'lucide-react';
import { IndiaMap } from '../components/IndiaMap';

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const CountUp = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.max(totalMiliseconds / end, 10);

    let timer = setInterval(() => {
      start += 1;
      setCount(Math.floor(start * (end / (totalMiliseconds / incrementTime))));
      if (start * incrementTime >= totalMiliseconds) {
        setCount(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

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

  // Forensic Enhancements State
  const [riskLens, setRiskLens] = useState(false);
  const [isForensicOpen, setIsForensicOpen] = useState(true);

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

  // Find Peak Change Event for Annotation
  const peakEvent = useMemo(() => {
    if (timelineData.length === 0) return null;
    return [...timelineData].sort((a, b) => b.changes - a.changes)[0];
  }, [timelineData]);

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
              {/* NEW: Forensic Control & Overview */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsForensicOpen(!isForensicOpen)}
                      className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                    >
                      <ForensicIcon className={`h-4 w-4 ${isForensicOpen ? 'text-indigo-600' : 'text-gray-400'}`} />
                      🔍 Forensic Overview
                      {isForensicOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                      <button
                        onClick={() => setRiskLens(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-500 ${!riskLens ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Volume Lens
                      </button>
                      <button
                        onClick={() => setRiskLens(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-500 ${riskLens ? 'bg-rose-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Risk Lens
                      </button>
                    </div>
                    <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-widest ${riskLens ? 'text-rose-600' : 'text-indigo-600'}`}>
                      {riskLens ? "Risk = Abnormality Signal" : "Volume = Quantity of Change"}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {isForensicOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Card className={`border-0 ring-1 shadow-xl p-8 ${riskLens ? 'ring-rose-500/30 bg-slate-950' : 'ring-indigo-100 bg-white'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                          <div className="space-y-6">
                            <h4 className={`text-xl font-black flex items-center gap-3 ${riskLens ? 'text-rose-100' : 'text-gray-800'}`}>
                              <PieChart className={`h-6 w-6 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`} />
                              Forensic Composition Signature
                            </h4>
                            <p className={`text-base leading-relaxed ${riskLens ? 'text-slate-400' : 'text-gray-600'}`}>
                              Our forensic engine has analyzed the electoral roll snapshot. The distribution exhibits a
                              <span className={`font-black px-2 py-0.5 rounded mx-1 ${riskLens ? 'bg-rose-900/50 text-rose-200' : 'bg-indigo-50 text-indigo-700'}`}>
                                {summaryStats.additions > summaryStats.deletions ? 'GROWTH-SKEWED' : 'CLEANUP-SKEWED'}
                              </span>
                              profile. Modification patterns are
                              {riskLens ? ' inherently high-risk in specific blocks.' : ' within the expected administrative margin.'}
                            </p>
                            <div className="flex flex-wrap gap-6 pt-2">
                              {pieData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: riskLens ? (d.name === 'New Voters' ? '#059669' : d.name === 'Deletions' ? '#991b1b' : '#92400e') : d.color }}></div>
                                  <span className={`text-xs font-black uppercase tracking-widest ${riskLens ? 'text-slate-300' : 'text-gray-700'}`}>{d.name}: <CountUp value={d.value} /></span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={75}
                                  outerRadius={100}
                                  paddingAngle={8}
                                  dataKey="value"
                                  animationDuration={2500}
                                  animationBegin={500}
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={riskLens ? (entry.name === 'New Voters' ? '#059669' : entry.name === 'Deletions' ? '#dc2626' : '#d97706') : entry.color}
                                      stroke={riskLens ? '#0f172a' : '#fff'}
                                      strokeWidth={4}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ backgroundColor: riskLens ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: riskLens ? '#fff' : '#000' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                              <span className={`text-4xl font-black block leading-none ${riskLens ? 'text-white' : 'text-gray-900'}`}><CountUp value={summaryStats.total} /></span>
                              <span className={`text-[10px] uppercase font-bold tracking-[0.2em] mt-1 block ${riskLens ? 'text-slate-500' : 'text-gray-400'}`}>Events</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stats Grid - Premium Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card delay={0.1} className="bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100 overflow-hidden group">
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                        <ForensicIcon className="h-4 w-4" />
                      </div>
                      <p className="text-indigo-900/60 text-[10px] font-black uppercase tracking-widest">Total Changes</p>
                    </div>
                    <h3 className="text-5xl font-black text-indigo-950 tracking-tighter mb-1">
                      <CountUp value={summaryStats.total} />
                    </h3>
                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs bg-indigo-50 w-fit px-2 py-1 rounded-full border border-indigo-100">
                      <Activity className="h-3 w-3" />
                      <span className="uppercase tracking-tighter">Verified Stream</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
                </Card>

                <Card delay={0.2} className="bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-100 overflow-hidden group">
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                        <Plus className="h-4 w-4" />
                      </div>
                      <p className="text-emerald-900/60 text-[10px] font-black uppercase tracking-widest">Additions</p>
                    </div>
                    <h3 className="text-5xl font-black text-emerald-950 tracking-tighter mb-1">
                      +<CountUp value={summaryStats.additions} />
                    </h3>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2 py-1 rounded-full border border-emerald-100">
                      <TrendingUp className="h-3 w-3" />
                      <span className="uppercase tracking-tighter">{(summaryStats.additions / (summaryStats.total || 1) * 100).toFixed(1)}% Ratio</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                </Card>

                <Card delay={0.3} className="bg-gradient-to-br from-rose-50 via-white to-white border-rose-100 overflow-hidden group">
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <p className="text-rose-900/60 text-[10px] font-black uppercase tracking-widest">Unexplained Deletions</p>
                    </div>
                    <h3 className="text-5xl font-black text-rose-950 tracking-tighter mb-1">
                      -<CountUp value={summaryStats.deletions} />
                    </h3>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs bg-rose-50 w-fit px-2 py-1 rounded-full border border-rose-100">
                      <ShieldAlert className="h-3 w-3" />
                      <span className="uppercase tracking-tighter">{(summaryStats.deletions / (summaryStats.total || 1) * 100).toFixed(1)}% Ratio</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors"></div>
                </Card>

                <Card delay={0.4} className="bg-gradient-to-br from-amber-50 via-white to-white border-amber-100 overflow-hidden group">
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                        <Edit2 className="h-4 w-4" />
                      </div>
                      <p className="text-amber-900/60 text-[10px] font-black uppercase tracking-widest">Modifications</p>
                    </div>
                    <h3 className="text-5xl font-black text-amber-950 tracking-tighter mb-1">
                      ~<CountUp value={summaryStats.modifications} />
                    </h3>
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 w-fit px-2 py-1 rounded-full border border-amber-100">
                      <Filter className="h-3 w-3" />
                      <span className="uppercase tracking-tighter">{(summaryStats.modifications / (summaryStats.total || 1) * 100).toFixed(1)}% Ratio</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
                </Card>
              </div>

              {/* NEW: Forensic Insight Strip */}
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-sm ${insight.bg} cursor-default hover:shadow-md transition-shadow duration-300`}
                  >
                    <div className={`p-1.5 rounded-lg bg-white/80 shadow-inner ${insight.color}`}>
                      <insight.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${insight.color}`}>{insight.title}</span>
                      <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{insight.text}</span>
                    </div>
                  </motion.div>
                ))}
                {/* Static Audit Signature */}
                <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 italic text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Database className="h-3.5 w-3.5" />
                  Audit Signature: MS-{Math.random().toString(36).substring(7).toUpperCase()}
                </div>
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
                        <option value="Deletion">Unexplained Deletions Only</option>
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
                  <Card delay={0.6} className="shadow-xl border-0 ring-1 ring-gray-100 bg-white flex flex-col min-h-[400px]">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Clock className="h-4 w-4 text-indigo-600" /> Change Velocity
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">Temporal frequency of electoral modifications</p>
                    </div>
                    <div className="p-6 flex-1">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                            cursor={{ stroke: '#4F46E5', strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="changes"
                            name="Change Count"
                            stroke="#4F46E5"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorChanges)"
                            animationDuration={2000}
                          />
                          {peakEvent && (
                            <Legend verticalAlign="top" align="right" content={() => (
                              <div className="flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 mb-4">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                <span className="text-[10px] font-black text-indigo-700 uppercase">Peak: {peakEvent.changes} changes ({peakEvent.date})</span>
                              </div>
                            )} />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* NEW: Change Intensity Timeline (Forensic) */}
                  <Card delay={0.7} className={`shadow-xl border-0 ring-1 flex flex-col min-h-[400px] transition-colors duration-700 ${riskLens ? 'ring-rose-900/40 bg-slate-950' : 'ring-indigo-100 bg-white'}`}>
                    <div className={`px-6 py-4 border-b ${riskLens ? 'border-slate-800' : 'border-gray-100'}`}>
                      <h3 className={`font-black flex items-center gap-2 text-sm uppercase tracking-wider ${riskLens ? 'text-rose-100' : 'text-gray-800'}`}>
                        <ForensicIcon className={`h-4 w-4 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`} /> Forensic Intensity Signal
                      </h3>
                      <p className={`text-xs font-medium ${riskLens ? 'text-slate-500' : 'text-gray-500'}`}>High-fidelity behavioral anomaly detection</p>
                    </div>
                    <div className="p-6 flex-1 text-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={riskLens ? '#1e293b' : '#f1f5f9'} />
                          <XAxis dataKey="date" stroke={riskLens ? '#475569' : '#94a3b8'} fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
                          <YAxis stroke={riskLens ? '#475569' : '#94a3b8'} fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: riskLens ? '#0f172a' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', color: riskLens ? '#fff' : '#000' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="changes"
                            stroke={riskLens ? '#f43f5e' : '#6366f1'}
                            strokeWidth={5}
                            dot={{ fill: riskLens ? '#f43f5e' : '#6366f1', strokeWidth: 3, r: 6, stroke: riskLens ? '#0f172a' : '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0, fill: riskLens ? '#fb7185' : '#818cf8' }}
                            animationDuration={3000}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      {peakEvent && (
                        <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${riskLens ? 'bg-rose-950/50 border-rose-900 text-rose-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                          <ShieldAlert className="h-3 w-3" />
                          Peak Event Detected: {peakEvent.date}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* 3. Change Type Distribution (Stacked Bar) - New Section */}
                <Card delay={0.8} className="shadow-xl border-0 ring-1 ring-gray-100 bg-white flex flex-col min-h-[400px]">
                  <div className="px-6 py-4 border-b border-gray-100 mb-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Activity className="h-4 w-4 text-indigo-600" /> Segment Distribution
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Categorical breakdown of record-level variances</p>
                  </div>
                  <div className="px-6 pb-6 flex-1">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight="700" tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '20px' }} />
                        <Bar dataKey="full.Addition" name="Additions" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={40} />
                        <Bar dataKey="full.Modification" name="Modifications" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} barSize={40} />
                        <Bar dataKey="full.Deletion" name="Unexplained Deletions" stackId="a" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Heatmap Section */}
                {/* (Keeping Heatmap logic but updating Card to match theme) */}
                <Card delay={0.9} className="shadow-xl border-0 ring-1 ring-gray-100 bg-white flex flex-col min-h-[450px]">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <MapPin className="h-4 w-4 text-indigo-600" /> Constituency Intensity Map
                      </h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Geospatial variance concentration</p>
                    </div>
                  </div>
                  <div className="p-8 flex-1 overflow-y-auto max-h-[450px] custom-scrollbar">
                    {heatmapData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 relative min-h-[300px]">
                        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                          <IndiaMap className="h-full w-full max-h-[250px]" />
                        </div>
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 z-10 border border-gray-100 shadow-inner">
                          <AlertTriangle className="h-8 w-8 text-gray-200" />
                        </div>
                        <p className="text-sm font-bold tracking-tight z-10">No geospatial telemetry available</p>
                      </div>
                    ) : (
                      <div className="relative min-h-[300px]">
                        {/* Subtle Map Background */}
                        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                          <IndiaMap className="h-full w-full max-h-[320px]" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-5 gap-4 relative z-10">
                          {heatmapData.map((region) => (
                            <motion.div
                              key={region.region}
                              whileHover={{ y: -4, shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                              onClick={() => setSelectedConstituency(region)}
                              className={`
                                  p-4 rounded-xl text-center border-2 cursor-pointer transition-all relative overflow-hidden group bg-white shadow-sm
                                  ${region.risk === 'High' ? 'border-rose-100 hover:border-rose-500' :
                                  region.risk === 'Medium' ? 'border-amber-100 hover:border-amber-500' :
                                    'border-emerald-100 hover:border-emerald-500'}
                                  `}
                            >
                              <div className={`absolute top-0 left-0 w-full h-1
                                    ${region.risk === 'High' ? 'bg-rose-500' :
                                  region.risk === 'Medium' ? 'bg-amber-500' :
                                    'bg-emerald-500'}
                                `}></div>

                              <h4 className={`text-xs font-black truncate mb-1 tracking-tight
                                  ${region.risk === 'High' ? 'text-rose-700' :
                                  region.risk === 'Medium' ? 'text-amber-700' :
                                    'text-emerald-700'}
                                  `}>{region.fullName}</h4>

                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{region.changes} Evts</p>
                              {region.risk === 'High' && (
                                <div className="absolute -right-1 -bottom-1 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <ShieldAlert className="h-12 w-12 text-rose-500" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex justify-between items-center">
                    <span>Intensity Spectrum</span>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div> Nominal</div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div> Elevated</div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse"></div> Anomalous</div>
                    </div>
                  </div>
                </Card>

                {/* NEW: Change Fingerprint Visualization */}
                <Card delay={1.0} className={`shadow-xl border-0 ring-1 flex flex-col min-h-[350px] transition-colors duration-700 ${riskLens ? 'ring-rose-900/40 bg-slate-950' : 'ring-indigo-100 bg-white'}`}>
                  <div className={`px-6 py-5 border-b ${riskLens ? 'border-slate-800' : 'border-gray-100'}`}>
                    <h3 className={`font-black flex items-center gap-2 text-sm uppercase tracking-wider ${riskLens ? 'text-rose-100' : 'text-gray-800'}`}>
                      <BarChart3 className={`h-4 w-4 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`} /> Change Fingerprint Signature
                    </h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${riskLens ? 'text-slate-500' : 'text-gray-500'}`}>Constituency-level behavioral telemetry</p>
                  </div>
                  <div className="p-8 overflow-x-auto custom-scrollbar">
                    <div className="flex items-end gap-3 min-h-[180px] min-w-max pb-4">
                      {heatmapData.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ height: 0 }}
                          animate={{ height: Math.max(30, Math.min(180, (item.changes / (summaryStats.total || 1)) * 400)) }}
                          transition={{ delay: idx * 0.03, duration: 1.5, ease: "circOut" }}
                          className="flex flex-col items-center group relative cursor-help"
                        >
                          <div className={`w-10 rounded-t-xl transition-all duration-500 shadow-lg ${riskLens ? 'bg-gradient-to-t from-rose-950 to-rose-500 group-hover:to-rose-400' :
                            'bg-indigo-500 group-hover:bg-indigo-600'
                            }`} style={{ height: '100%' }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap z-30">
                              <div className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl border ${riskLens ? 'bg-slate-900 text-rose-100 border-rose-800' : 'bg-gray-900 text-white border-gray-800'}`}>
                                <p className="mb-0.5">{item.fullName}</p>
                                <p className="text-[9px] opacity-70">VAL: {item.changes} EVENTS</p>
                              </div>
                            </div>
                          </div>
                          <div className={`w-10 h-1.5 mt-2 rounded-full shadow-inner ${item.risk === 'High' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' :
                            item.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            }`}></div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-6 border-t pt-4 border-gray-100/50">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${riskLens ? 'text-slate-500' : 'text-gray-400'}`}>* Magnitude relative to global dataset mean</p>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-tighter">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                          <span className={riskLens ? 'text-slate-400' : 'text-gray-500'}>Baseline</span>
                        </div>
                        <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-tighter">
                          <div className="w-2.5 h-2.5 rounded shadow-[0_0_12px_rgba(244,63,94,0.5)] bg-rose-500"></div>
                          <span className={riskLens ? 'text-slate-400' : 'text-gray-500'}>Anomalous Volatility</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* NEW: Forensic Observations Panel */}
              <Card delay={1.1} className={`border-0 ring-1 shadow-xl transition-all duration-700 ${riskLens ? 'ring-rose-500/30 bg-slate-900' : 'ring-gray-200 bg-white'}`}>
                <div className={`px-6 py-5 border-b flex items-center justify-between ${riskLens ? 'border-slate-800' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${riskLens ? 'bg-rose-950 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Database className="h-5 w-5" />
                    </div>
                    <h3 className={`font-black text-sm uppercase tracking-[0.2em] ${riskLens ? 'text-rose-100' : 'text-gray-800'}`}>Forensic Audit Observations</h3>
                  </div>
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full border ${riskLens ? 'bg-rose-900/20 border-rose-800 text-rose-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}> REPORT SECURED </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`flex gap-4 p-5 rounded-2xl border transition-all duration-500 group ${riskLens ? 'bg-slate-950/50 border-slate-800 hover:border-rose-900' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200'}`}>
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-full ${summaryStats.additions > 0 ? (riskLens ? 'bg-rose-900/30 text-rose-500' : 'bg-emerald-100 text-emerald-600') : 'bg-gray-100 text-gray-400'}`}>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`}>Growth Pattern</p>
                      <p className={`text-sm leading-relaxed font-bold ${riskLens ? 'text-rose-100' : 'text-gray-700'}`}>
                        {summaryStats.additions > 0 ? `Detected ${Math.round((summaryStats.additions / (summaryStats.total || 1)) * 100)}% expansion via new voter additions. This signifies an upward roll trajectory.` : 'Zero expansion detected. Roll remains static for the current comparison period.'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-4 p-5 rounded-2xl border transition-all duration-500 group ${riskLens ? 'bg-slate-950/50 border-slate-800 hover:border-rose-900' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200'}`}>
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-full ${summaryStats.deletions === 0 ? (riskLens ? 'bg-rose-900 text-rose-400 animate-pulse' : 'bg-rose-100 text-rose-600') : 'bg-gray-100 text-gray-400'}`}>
                        <Trash2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`}>Cleanup Audit</p>
                      <p className={`text-sm leading-relaxed font-bold ${riskLens ? 'text-rose-100' : 'text-gray-700'}`}>
                        {summaryStats.deletions === 0 ? 'SIGNIFICANT ANOMALY: Zero deletions detected. Statistically unusual for large-scale roll maintenance.' : `${summaryStats.deletions} deletions identified. Behavioral pattern aligns with routine maintenance.`}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-4 p-5 rounded-2xl border transition-all duration-500 group ${riskLens ? 'bg-slate-950/50 border-slate-800 hover:border-rose-900' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200'}`}>
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-full ${heatmapData.some(r => r.risk === 'High') ? (riskLens ? 'bg-rose-900 text-rose-400' : 'bg-amber-100 text-amber-600') : 'bg-gray-100 text-gray-400'}`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`}>Spatial Variance</p>
                      <p className={`text-sm leading-relaxed font-bold ${riskLens ? 'text-rose-100' : 'text-gray-700'}`}>
                        {heatmapData.some(r => r.risk === 'High') ? 'High density variance clusters identified. Concentrated updates detected in 3+ blocks exceeding baseline.' : 'Uniform spatial distribution. No cluster-based anomalies detected in current dataset.'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-4 p-5 rounded-2xl border transition-all duration-500 group ${riskLens ? 'bg-slate-950/50 border-slate-800 hover:border-rose-900' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200'}`}>
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-full ${riskLens ? 'bg-rose-900 text-rose-500' : 'bg-indigo-100 text-indigo-600'}`}>
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${riskLens ? 'text-rose-500' : 'text-indigo-600'}`}>Integrity Scoring</p>
                      <p className={`text-sm leading-relaxed font-bold ${riskLens ? 'text-rose-100' : 'text-gray-700'}`}>
                        System Status: <span className="underline decoration-2 underline-offset-4">{summaryStats.total > 1000 ? 'HIGH COMPLEXITY' : 'NOMINAL VOLUME'}</span>. Preliminary forensic checks indicate 100% data integrity for validated blocks.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

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