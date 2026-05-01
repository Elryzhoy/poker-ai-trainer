import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface HandHistory {
  id: string;
  platform: string;
  smallBlind: number;
  bigBlind: number;
  seats: Array<{
    seatNumber: number;
    playerName: string;
    stackSize: number;
  }>;
  actions: Array<{
    player: string;
    action: string;
    amount?: number;
  }>;
  board: string[];
  totalPot: number;
}

interface AnalysisResult {
  handId: string;
  analysis: string;
  tokensUsed: number;
  model: string;
}

const PLATFORMS = [
  { value: 'pokerstars', label: 'PokerStars' },
  { value: 'ggpoker', label: 'GGPoker' },
  { value: '888poker', label: '888poker' },
  { value: 'partypoker', label: 'PartyPoker' },
  { value: 'winamax', label: 'Winamax' },
];

export function HandHistoryUpload() {
  const [handHistory, setHandHistory] = useState('');
  const [platform, setPlatform] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedHands, setParsedHands] = useState<HandHistory[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = useCallback(async () => {
    if (!handHistory.trim()) {
      setError('Please paste your hand history');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/hand-history/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handHistory, platform: platform || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse hand history');
      }

      setParsedHands(data.hands);
      setSuccess(`Successfully parsed ${data.handCount} hands`);
    } catch (err: any) {
      setError(err.message || 'Failed to parse hand history');
    } finally {
      setIsUploading(false);
    }
  }, [handHistory, platform]);

  const handleAnalyze = useCallback(async () => {
    if (parsedHands.length === 0) {
      setError('Please upload hand history first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/hand-history/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hands: parsedHands, userLevel: 'intermediate' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze hands');
      }

      setAnalysisResults(data.analyses);
      setSuccess(`Analysis complete! Used ${data.tokensUsed} tokens`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze hands');
    } finally {
      setIsAnalyzing(false);
    }
  }, [parsedHands]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Hand History
          </CardTitle>
          <CardDescription>
            Paste your hand history from supported poker platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform (Optional)</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hand History Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hand History</label>
            <Textarea
              placeholder="Paste your hand history here..."
              value={handHistory}
              onChange={(e) => setHandHistory(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Parse Hands
                </>
              )}
            </Button>

            {parsedHands.length > 0 && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="secondary">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze with AI'
                )}
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Parsed Hands Summary */}
      {parsedHands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Hands ({parsedHands.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsedHands.slice(0, 5).map((hand, index) => (
                <div key={hand.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-mono text-sm">Hand #{hand.id}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ${hand.smallBlind}/${hand.bigBlind}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {hand.seats.length} players
                  </Badge>
                </div>
              ))}
              {parsedHands.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  ... and {parsedHands.length - 5} more hands
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
            <CardDescription>
              Analysis of {analysisResults.length} hands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResults.map((result, index) => (
                <div key={result.handId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Hand #{result.handId}</span>
                    <Badge variant="secondary">
                      {result.tokensUsed} tokens
                    </Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {result.analysis.split('\n').map((line, i) => (
                      <p key={i} className="text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HandHistoryUpload;
