import { useState, useEffect } from 'react';
import { Video, Download, Clock, CheckCircle, PlayCircle, AlertCircle, Crown } from 'lucide-react';

export default function VideoGenerationDashboard() {
  const [scenes, setScenes] = useState([
    {
      id: 1,
      name: "Card Opens",
      description: "Luxury greeting card with golden sparkles",
      status: "completed",
      downloadUrl: null,
      prompt: "Cinematic luxury greeting card opening in slow motion, black velvet background with gold foil accents...",
      duration: "10s",
      quality: "720p",
      completedAt: "5:00 PM"
    },
    {
      id: 2, 
      name: "Card Transition",
      description: "Card floating to back corner",
      status: "completed",
      downloadUrl: null,
      prompt: "Elegant greeting card gracefully floating and rotating through space...",
      duration: "10s",
      quality: "720p",
      completedAt: "5:02 PM"
    },
    {
      id: 3,
      name: "Balloons Rise", 
      description: "Black/gold balloons carrying Victorian box",
      status: "completed",
      downloadUrl: null,
      prompt: "Luxurious black and gold balloons rising majestically from bottom of frame...",
      duration: "10s",
      quality: "720p",
      completedAt: "5:04 PM"
    },
    {
      id: 4,
      name: "Box Display",
      description: "Victorian box with Digital Bloom logo",
      status: "completed", 
      downloadUrl: null,
      prompt: "Ornate Victorian gift box center frame with intricate golden patterns...",
      duration: "10s",
      quality: "720p",
      completedAt: "5:06 PM"
    },
    {
      id: 5,
      name: "Box Opens",
      description: "Box reveals golden light + rose petals",
      status: "generating",
      progress: 75,
      prompt: "Victorian gift box opens dramatically in slow motion revealing burst of golden light...",
      duration: "8-10s",
      quality: "720p",
      estimatedCompletion: "5:15 PM"
    },
    {
      id: 6,
      name: "Flower Whirlwind",
      description: "Rose petals swirling with effects",
      status: "queued",
      prompt: "Magnificent whirlwind of red roses and pink petals swirling in elegant spiral motion...",
      duration: "8-10s",
      quality: "720p",
      estimatedStart: "5:15 PM"
    },
    {
      id: 7,
      name: "Final Message",
      description: "All elements settle with final message",
      status: "queued",
      prompt: "All elements settle into perfect harmony with final custom message...",
      duration: "6-8s", 
      quality: "720p",
      estimatedStart: "5:25 PM"
    }
  ]);

  const [overallProgress, setOverallProgress] = useState(71);
  const [finalSequence, setFinalSequence] = useState({
    status: "pending",
    totalDuration: "60s",
    fileSize: "~35MB",
    pricing: "$19.99"
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setScenes(prevScenes => 
        prevScenes.map(scene => {
          if (scene.status === "generating" && scene.progress < 100) {
            const newProgress = Math.min(scene.progress + 5, 100);
            if (newProgress === 100) {
              return { ...scene, status: "completed", progress: undefined, completedAt: new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}) };
            }
            return { ...scene, progress: newProgress };
          }
          return scene;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status, progress) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "generating":
        return <PlayCircle className="w-5 h-5 text-orange-500 animate-pulse" />;
      case "queued":
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-800";
      case "generating": 
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "queued":
        return "bg-gray-50 border-gray-200 text-gray-600";
      default:
        return "bg-gray-50 border-gray-200 text-gray-500";
    }
  };

  const completedScenes = scenes.filter(s => s.status === "completed").length;

  const handleDownload = (sceneId) => {
    // Simulate download
    const utterance = new SpeechSynthesisUtterance(`Downloading scene ${sceneId}`);
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleStitchSequence = () => {
    if (completedScenes === 7) {
      const utterance = new SpeechSynthesisUtterance("Stitching complete sequence for premium Tier 4 product");
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      
      setFinalSequence(prev => ({ ...prev, status: "stitching" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Gamble's 7-Scene Generation
          </h1>
          <Crown className="w-8 h-8 text-yellow-500" />
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-yellow-100">Overall Progress</span>
            <span className="text-yellow-400 font-bold">{completedScenes}/7 Complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedScenes / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scene Progress */}
      <div className="space-y-4 mb-8">
        {scenes.map((scene) => (
          <div 
            key={scene.id}
            className={`rounded-xl p-4 border ${getStatusColor(scene.status)} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(scene.status, scene.progress)}
                <div>
                  <h3 className="font-semibold">Scene {scene.id}: {scene.name}</h3>
                  <p className="text-sm opacity-75">{scene.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">{scene.quality} • {scene.duration}</div>
                {scene.status === "completed" && (
                  <div className="text-xs opacity-75">✅ {scene.completedAt}</div>
                )}
                {scene.status === "generating" && (
                  <div className="text-xs opacity-75">⏱️ {scene.estimatedCompletion}</div>
                )}
                {scene.status === "queued" && (
                  <div className="text-xs opacity-75">📋 {scene.estimatedStart}</div>
                )}
              </div>
            </div>
            
            {scene.status === "generating" && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Generating...</span>
                  <span>{scene.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scene.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {scene.status === "completed" && (
              <button 
                onClick={() => handleDownload(scene.id)}
                className="mt-3 flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Final Sequence Status */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-purple-100">Final Luxury Sequence</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-300">{finalSequence.totalDuration}</div>
            <div className="text-sm text-purple-200">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-300">{finalSequence.fileSize}</div>
            <div className="text-sm text-purple-200">File Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{finalSequence.pricing}</div>
            <div className="text-sm text-purple-200">Tier 4 Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">97.5%</div>
            <div className="text-sm text-purple-200">Profit Margin</div>
          </div>
        </div>

        {completedScenes === 7 ? (
          <button 
            onClick={handleStitchSequence}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            🎬 Stitch Complete Luxury Sequence
          </button>
        ) : (
          <div className="text-center text-purple-300">
            <Clock className="w-5 h-5 inline mr-2" />
            Waiting for all scenes to complete ({completedScenes}/7)
          </div>
        )}
      </div>

      {/* Live Status */}
      <div className="text-center mt-6 text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Status • Auto-updates every 3 seconds
        </div>
        <div className="mt-1">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}