
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Trash2, Save, Music, Clock, Sparkles } from 'lucide-react';
import { LyricLine, Track } from '../contexts/MusicContext';
import { useMusic } from '../contexts/MusicContext';
import { supabase } from '../integrations/supabase/client';

interface LyricsEditorProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({ track, isOpen, onClose }) => {
  const { updateTrackLyrics } = useMusic();
  const [lyrics, setLyrics] = useState<LyricLine[]>(track.lyrics || []);
  const [bulkLyricsText, setBulkLyricsText] = useState('');
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addLyricLine = () => {
    setLyrics(prev => [...prev, {
      time: 0,
      words: [{ word: '', start: 0, end: 0 }]
    }]);
  };

  const updateLine = (lineIndex: number, field: 'time', value: number) => {
    setLyrics(prev => prev.map((line, i) => 
      i === lineIndex ? { ...line, [field]: value } : line
    ));
  };

  const updateWord = (lineIndex: number, wordIndex: number, field: string, value: string | number) => {
    setLyrics(prev => prev.map((line, i) => 
      i === lineIndex ? {
        ...line,
        words: line.words.map((word, j) => 
          j === wordIndex ? { ...word, [field]: value } : word
        )
      } : line
    ));
  };

  const addWord = (lineIndex: number) => {
    setLyrics(prev => prev.map((line, i) => 
      i === lineIndex ? {
        ...line,
        words: [...line.words, { word: '', start: 0, end: 0 }]
      } : line
    ));
  };

  const removeWord = (lineIndex: number, wordIndex: number) => {
    setLyrics(prev => prev.map((line, i) => 
      i === lineIndex ? {
        ...line,
        words: line.words.filter((_, j) => j !== wordIndex)
      } : line
    ));
  };

  const removeLine = (lineIndex: number) => {
    setLyrics(prev => prev.filter((_, i) => i !== lineIndex));
  };

  const parseSimpleLyrics = () => {
    const lines = bulkLyricsText.split('\n').filter(line => line.trim());
    const parsedLyrics: LyricLine[] = lines.map((line, index) => {
      const words = line.trim().split(/\s+/);
      const lineStartTime = index * 4; // 4 seconds per line as default
      
      return {
        time: lineStartTime,
        words: words.map((word, wordIndex) => ({
          word,
          start: lineStartTime + (wordIndex * 0.5),
          end: lineStartTime + ((wordIndex + 1) * 0.5)
        }))
      };
    });
    
    setLyrics(parsedLyrics);
    setBulkLyricsText('');
  };

  const analyzeWithAI = async () => {
    if (!bulkLyricsText.trim()) {
      alert('Please enter lyrics first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-lyrics-timing', {
        body: {
          audioUrl: track.audioUrl,
          lyrics: bulkLyricsText
        }
      });

      if (error) throw error;

      if (data.timedLyrics) {
        setLyrics(data.timedLyrics);
        setBulkLyricsText('');
      }
    } catch (error) {
      console.error('Error analyzing lyrics timing:', error);
      alert('Failed to analyze lyrics timing. Please try the manual timing option.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveLyrics = () => {
    updateTrackLyrics(track.id, lyrics);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modern-card bg-black border border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Lyrics</h2>
              <p className="text-gray-400 text-sm">{track.title} - {track.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              {isSimpleMode ? 'Advanced' : 'Simple'}
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          {isSimpleMode ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">Paste Lyrics (one line per verse)</Label>
                <Textarea
                  value={bulkLyricsText}
                  onChange={(e) => setBulkLyricsText(e.target.value)}
                  placeholder="Paste your lyrics here, one line per verse..."
                  className="bg-black/50 border-gray-600 text-white min-h-[200px] focus:border-white/50"
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={analyzeWithAI} 
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Auto-Time Lyrics
                    </>
                  )}
                </Button>
                
                <Button onClick={parseSimpleLyrics} variant="outline" className="flex-1">
                  <Music className="w-4 h-4 mr-2" />
                  Manual Timing
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                AI timing analyzes your lyrics and creates realistic timing based on music patterns. 
                Manual timing creates basic 4-second intervals.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 font-medium">Detailed Lyrics Editor</Label>
                <Button onClick={addLyricLine} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <div className="space-y-4">
                {lyrics.map((line, lineIndex) => (
                  <Card key={lineIndex} className="bg-gray-900/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-gray-300">Line {lineIndex + 1}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-400">Start Time (s):</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={line.time}
                            onChange={(e) => updateLine(lineIndex, 'time', parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 bg-black/50 border-gray-600 text-white text-xs"
                          />
                          <Button
                            onClick={() => removeLine(lineIndex)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {line.words.map((word, wordIndex) => (
                        <div key={wordIndex} className="flex items-center gap-2">
                          <Input
                            placeholder="Word"
                            value={word.word}
                            onChange={(e) => updateWord(lineIndex, wordIndex, 'word', e.target.value)}
                            className="flex-1 bg-black/50 border-gray-600 text-white h-8 text-sm"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Start"
                            value={word.start}
                            onChange={(e) => updateWord(lineIndex, wordIndex, 'start', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-black/50 border-gray-600 text-white h-8 text-xs"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="End"
                            value={word.end}
                            onChange={(e) => updateWord(lineIndex, wordIndex, 'end', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-black/50 border-gray-600 text-white h-8 text-xs"
                          />
                          {line.words.length > 1 && (
                            <Button
                              onClick={() => removeWord(lineIndex, wordIndex)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        onClick={() => addWord(lineIndex)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Word
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {lyrics.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <Button onClick={saveLyrics} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                <Save className="w-5 h-5 mr-2" />
                Save Lyrics
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
