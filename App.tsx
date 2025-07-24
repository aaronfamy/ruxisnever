import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Upload, FileText, Zap, AlertCircle, Briefcase, MapPin, DollarSign, Sparkles, X, CheckCircle, ArrowRight, RotateCcw, ChevronDown, Lightbulb, Target, PenTool, ClipboardCheck, AlertTriangle, MessageSquare, Terminal, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS ---
interface JobMatch {
  id: string;
  title: string;
  company: string;
  matchPercentage: number;
  description: string;
  companyProfile: string;
  location: string;
  salary: string;
  type: string;
  requirements: string[];
}

interface AISuggestion {
    suggestion_title: string;
    suggestion_detail: string;
}

interface AIResponse {
    overall_summary: string;
    suggestions: AISuggestion[];
}

interface SkillsGapResponse {
    matching_skills: string[];
    missing_skills: string[];
    pro_tip: string;
}

interface InterviewQuestion {
    question: string;
    tip: string;
}
interface InterviewPrepResponse {
    behavioral_questions: InterviewQuestion[];
    technical_questions: InterviewQuestion[];
    final_tip: string;
}

// --- NEW INTERFACE FOR THE COVER LETTER FEATURE ---
interface CoverLetterResponse {
    cover_letter_text: string;
}


// --- HELPER COMPONENTS ---

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 p-8">
    <div className="flex justify-center">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-slate-600 border-t-sky-400 rounded-full"
        />
    </div>
    <h3 className="text-xl font-semibold text-white">{text}</h3>
    <p className="text-slate-400">Our AI is working its magic. Please wait a moment.</p>
  </motion.div>
);

const ErrorMessage: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3"
  >
    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-red-300 text-sm leading-relaxed">{message}</p>
    </div>
    <button onClick={onDismiss} className="text-red-400 hover:text-red-300 transition-colors">
      <X className="w-5 h-5" />
    </button>
  </motion.div>
);

// --- JOB CARD WITH DUAL DROPDOWNS & NEW BUTTON ---
const JobCard: React.FC<{ job: JobMatch; index: number; onAnalyzeSkills: (job: JobMatch) => void; onInterviewPrep: (job: JobMatch) => void; onGenerateCoverLetter: (job: JobMatch) => void; }> = ({ job, index, onAnalyzeSkills, onInterviewPrep, onGenerateCoverLetter }) => {
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-400/10 text-green-300 border-green-400/20';
    if (score >= 80) return 'bg-sky-400/10 text-sky-300 border-sky-400/20';
    if (score >= 70) return 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20';
    return 'bg-slate-400/10 text-slate-300 border-slate-400/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-white flex-1 min-w-0">{job.title}</h3>
          <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-lg font-bold ${getScoreColor(job.matchPercentage)}`}>
            {job.matchPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="mt-2">
            <button
                onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
                className="w-full flex items-center justify-between text-left text-sky-400 font-medium hover:text-sky-300 transition-colors group"
            >
                <span>{job.company}</span>
                <motion.div animate={{ rotate: isCompanyExpanded ? 180 : 0 }} className="transition-transform">
                    <ChevronDown size={20} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isCompanyExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '12px' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <p className="text-slate-300 text-sm leading-relaxed break-words">
                        {job.companyProfile}
                    </p>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin size={16} />{job.location}</span>
                    <span className="flex items-center gap-1.5"><Briefcase size={16} />{job.type}</span>
                </div>
                <button
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                    className="text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1"
                >
                    <span>Details</span>
                    <motion.div animate={{ rotate: isDetailsExpanded ? 180 : 0 }} className="transition-transform">
                        <ChevronDown size={16} />
                    </motion.div>
                </button>
            </div>

            <AnimatePresence>
                {isDetailsExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden space-y-4"
                >
                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Job Summary</h4>
                        <p className="text-slate-300 text-sm leading-relaxed break-words">{job.description}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Salary</h4>
                        <p className="text-slate-300">{job.salary}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Key Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs border border-slate-700">{req}</span>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button onClick={() => onAnalyzeSkills(job)} className="flex-1 text-center px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 rounded-lg font-semibold transition-colors">
                            Analyze Skills Gap
                        </button>
                        <button onClick={() => onInterviewPrep(job)} className="flex-1 text-center px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg font-semibold transition-colors">
                            AI Interview Prep
                        </button>
                    </div>
                    <div className="pt-2">
                         <button onClick={() => onGenerateCoverLetter(job)} className="w-full text-center px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-300 rounded-lg font-semibold transition-colors">
                            Generate Cover Letter
                        </button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// --- UPLOAD SECTION ---
const FileUpload: React.FC<{ 
    onFileSelect: (file: File) => void; 
    selectedFile: File | null;
}> = ({ onFileSelect, selectedFile }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div 
            className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 group ${
                dragActive ? 'border-sky-500 bg-sky-500/10 scale-105' : 
                selectedFile ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 hover:border-slate-600'
            }`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
            <input ref={inputRef} type="file" accept=".pdf" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            
            <AnimatePresence mode="wait">
                {selectedFile ? (
                    <motion.div key="selected" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="font-semibold text-white">{selectedFile.name}</p>
                        <p className="text-sm text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </motion.div>
                ) : (
                    <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-800 group-hover:bg-slate-700 transition-colors rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-sky-400 transition-colors" />
                        </div>
                        <p className="font-semibold text-white">Drop your resume here</p>
                        <p className="text-slate-400">or <span className="text-sky-400 font-medium">click to browse</span></p>
                        <p className="text-sm text-slate-500 mt-2">PDF files only, max 10MB</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SkillsGapModal: React.FC<{ result: SkillsGapResponse | null; jobTitle: string; onClose: () => void; isLoading: boolean }> = ({ result, jobTitle, onClose, isLoading }) => {
    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex-shrink-0 p-6 pb-4 border-b border-slate-800">
                    <button onClick={onClose} className="absolute top-3 right-3 h-9 w-9 bg-slate-800/50 hover:bg-slate-700/50 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-white">
                        <X size={22} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">Skills Gap Analysis</h2>
                        <p className="text-slate-400 mt-1">For: {jobTitle}</p>
                    </div>
                </div>

                <div className="overflow-y-auto p-6">
                    {isLoading && <LoadingSpinner text="Analyzing your skills..." />}
                    
                    {result && (
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <ClipboardCheck className="w-6 h-6 text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">Skills You Have</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.matching_skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-green-500/10 text-green-300 rounded-full text-sm">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                    <h3 className="text-lg font-semibold text-white">Skills to Develop</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 rounded-full text-sm">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Lightbulb className="w-6 h-6 text-sky-400" />
                                    <h3 className="text-lg font-semibold text-white">Pro Tip</h3>
                                </div>
                                <p className="text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">{result.pro_tip}</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const InterviewPrepModal: React.FC<{ result: InterviewPrepResponse | null; jobTitle: string; onClose: () => void; isLoading: boolean }> = ({ result, jobTitle, onClose, isLoading }) => {
    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex-shrink-0 p-6 pb-4 border-b border-slate-800">
                    <button onClick={onClose} className="absolute top-3 right-3 h-9 w-9 bg-slate-800/50 hover:bg-slate-700/50 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-white">
                        <X size={22} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">AI Interview Prep</h2>
                        <p className="text-slate-400 mt-1">For: {jobTitle}</p>
                    </div>
                </div>

                <div className="overflow-y-auto p-6">
                    {isLoading && <LoadingSpinner text="Generating interview questions..." />}
                    
                    {result && (
                        <div className="space-y-8 text-left">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <MessageSquare className="w-7 h-7 text-sky-400" />
                                    <h3 className="text-xl font-semibold text-white">Behavioral Questions</h3>
                                </div>
                                <div className="space-y-4">
                                    {result.behavioral_questions.map((q, i) => (
                                        <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <p className="font-semibold text-slate-200">{q.question}</p>
                                            <p className="text-sm text-slate-400 mt-2 border-l-2 border-sky-500 pl-3"><strong>Tip:</strong> {q.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Terminal className="w-7 h-7 text-green-400" />
                                    <h3 className="text-xl font-semibold text-white">Technical Questions</h3>
                                </div>
                                <div className="space-y-4">
                                    {result.technical_questions.map((q, i) => (
                                        <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <p className="font-semibold text-slate-200">{q.question}</p>
                                            <p className="text-sm text-slate-400 mt-2 border-l-2 border-green-500 pl-3"><strong>Tip:</strong> {q.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="w-7 h-7 text-indigo-400" />
                                    <h3 className="text-xl font-semibold text-white">Final Tip</h3>
                                </div>
                                <p className="text-slate-300 bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">{result.final_tip}</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// --- NEW COVER LETTER MODAL COMPONENT ---
const CoverLetterModal: React.FC<{ result: CoverLetterResponse | null; jobTitle: string; onClose: () => void; isLoading: boolean }> = ({ result, jobTitle, onClose, isLoading }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = () => {
        if (result?.cover_letter_text) {
            const textArea = document.createElement("textarea");
            textArea.value = result.cover_letter_text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000); // Reset after 2 seconds
            } catch (err) {
                setCopySuccess('Failed to copy');
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex-shrink-0 p-6 pb-4 border-b border-slate-800 flex justify-between items-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">AI Cover Letter</h2>
                        <p className="text-slate-400 mt-1">For: {jobTitle}</p>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 bg-slate-800/50 hover:bg-slate-700/50 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {isLoading && <LoadingSpinner text="Writing your cover letter..." />}
                    
                    {result && (
                        <div className="space-y-4 text-left">
                            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                {result.cover_letter_text}
                            </pre>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="flex-shrink-0 p-6 pt-4 border-t border-slate-800">
                        <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-300 rounded-lg font-semibold transition-colors">
                            <Copy size={16} />
                            <span>{copySuccess || 'Copy to Clipboard'}</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  type AppState = 'initial' | 'loading' | 'results' | 'improving' | 'improvedResult';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [improvedResume, setImprovedResume] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('initial');

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [skillsAnalysisResult, setSkillsAnalysisResult] = useState<SkillsGapResponse | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);

  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [interviewPrepResult, setInterviewPrepResult] = useState<InterviewPrepResponse | null>(null);
  const [isPrepLoading, setIsPrepLoading] = useState(false);

  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState<CoverLetterResponse | null>(null);
  const [isCoverLetterLoading, setIsCoverLetterLoading] = useState(false);

  const [analyzingJob, setAnalyzingJob] = useState<JobMatch | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file only.');
      setSelectedFile(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobMatches([]);
    setImprovedResume(null);
    setError(null);
    setAppState('initial');
    setResumeText('');
  };

  const analyzeResume = async () => {
    if (!selectedFile) return;
    setAppState('loading');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const response = await fetch('http://localhost:5000/analyze', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setJobMatches(data.matches || []);
      setResumeText(data.resume_text || '');
      setAppState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('initial');
    }
  };
  
  const improveResume = async () => {
    if (!selectedFile) return;
    setAppState('improving');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const response = await fetch('http://localhost:5000/improve_resume', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImprovedResume(data);
      setAppState('improvedResult');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('initial');
    }
  };

  const handleAnalyzeSkills = async (job: JobMatch) => {
    if (!resumeText) return;
    setAnalyzingJob(job);
    setIsSkillsModalOpen(true);
    setIsSkillsLoading(true);
    setSkillsAnalysisResult(null);
    setError(null);
    try {
        const jobDetails = `Title: ${job.title}\nDescription: ${job.description}\nRequirements: ${job.requirements.join(', ')}`;
        const response = await fetch('http://localhost:5000/analyze_skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, job_details: jobDetails })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setSkillsAnalysisResult(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze skills gap.');
        setIsSkillsModalOpen(false);
    } finally {
        setIsSkillsLoading(false);
    }
  };

  const handleInterviewPrep = async (job: JobMatch) => {
    if (!resumeText) return;
    setAnalyzingJob(job);
    setIsPrepModalOpen(true);
    setIsPrepLoading(true);
    setInterviewPrepResult(null);
    setError(null);
    try {
        const jobDetails = `Title: ${job.title}\nDescription: ${job.description}\nRequirements: ${job.requirements.join(', ')}`;
        const response = await fetch('http://localhost:5000/interview_prep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, job_details: jobDetails })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setInterviewPrepResult(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate interview prep.');
        setIsPrepModalOpen(false);
    } finally {
        setIsPrepLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (job: JobMatch) => {
    if (!resumeText) return;
    setAnalyzingJob(job);
    setIsCoverLetterModalOpen(true);
    setIsCoverLetterLoading(true);
    setCoverLetterResult(null);
    setError(null);
    try {
        const jobDetails = `Title: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\nRequirements: ${job.requirements.join(', ')}`;
        const response = await fetch('http://localhost:5000/generate_cover_letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, job_details: jobDetails })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setCoverLetterResult(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate cover letter.');
        setIsCoverLetterModalOpen(false);
    } finally {
        setIsCoverLetterLoading(false);
    }
  };
  
  const suggestionIcons: { [key: string]: React.ReactNode } = {
    "Use Stronger Action Verbs": <PenTool size={20} className="text-indigo-400" />,
    "Quantify Your Achievements": <Target size={20} className="text-indigo-400" />,
    "Clarity and Conciseness": <Lightbulb size={20} className="text-indigo-400" />,
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-sky-400 opacity-20 blur-[100px]"></div>
        </div>
        
        <header className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-sky-400" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-200">AI Resume Matcher</h1>
              </div>
              <AnimatePresence>
              {appState !== 'initial' && (
                  <motion.button 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={handleReset} 
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                      <RotateCcw size={14} />
                      <span>Start Over</span>
                  </motion.button>
              )}
              </AnimatePresence>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16">
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          <AnimatePresence mode="wait">
            {appState === 'initial' && (
              <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center space-y-4 mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">
                    Unlock Your Next Career Move
                  </h2>
                  <p className="text-lg text-slate-400 max-w-xl mx-auto">
                    Upload your resume and our AI will instantly find the most relevant jobs for you.
                  </p>
                </div>
                <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                {selectedFile && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={analyzeResume}
                      className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/20 transition-all duration-300 hover:bg-sky-600"
                    >
                      <span>Analyze & Match Jobs</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                     <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={improveResume}
                      className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:bg-indigo-600"
                    >
                      <span>Enhance with AI</span>
                      <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {appState === 'loading' && <LoadingSpinner text="Scanning Opportunities..." />}
            {appState === 'improving' && <LoadingSpinner text="Enhancing Your Resume..." />}

            {appState === 'results' && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center space-y-2 mb-10">
                  <h2 className="text-3xl font-bold text-white">Your Top Matches</h2>
                  <p className="text-slate-400">Based on your resume, here are the jobs you're most suited for.</p>
                </div>
                <div className="space-y-6">
                  {jobMatches.map((job, index) => (
                    <JobCard key={job.id} job={job} index={index} onAnalyzeSkills={handleAnalyzeSkills} onInterviewPrep={handleInterviewPrep} onGenerateCoverLetter={handleGenerateCoverLetter} />
                  ))}
                </div>
              </motion.div>
            )}

            {appState === 'improvedResult' && improvedResume && (
               <motion.div key="improved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center space-y-2 mb-10">
                      <h2 className="text-3xl font-bold text-white">AI-Powered Resume Review</h2>
                      <p className="text-slate-400">{improvedResume.overall_summary}</p>
                  </div>
                  <div className="space-y-6">
                      {improvedResume.suggestions.map((suggestion, index) => (
                          <motion.div 
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.15 }}
                              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                          >
                              <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                      {suggestionIcons[suggestion.suggestion_title] || <Sparkles size={20} className="text-indigo-400" />}
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-bold text-white mb-2">{suggestion.suggestion_title}</h4>
                                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{suggestion.suggestion_detail}</p>
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                  </div>
               </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {isSkillsModalOpen && (
            <SkillsGapModal 
                isLoading={isSkillsLoading}
                result={skillsAnalysisResult}
                jobTitle={analyzingJob?.title || ''}
                onClose={() => setIsSkillsModalOpen(false)}
            />
        )}
        {isPrepModalOpen && (
            <InterviewPrepModal
                isLoading={isPrepLoading}
                result={interviewPrepResult}
                jobTitle={analyzingJob?.title || ''}
                onClose={() => setIsPrepModalOpen(false)}
            />
        )}
        {isCoverLetterModalOpen && (
            <CoverLetterModal
                isLoading={isCoverLetterLoading}
                result={coverLetterResult}
                jobTitle={analyzingJob?.title || ''}
                onClose={() => setIsCoverLetterModalOpen(false)}
            />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
