import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RotateCcw, Target } from 'lucide-react';

interface RangeQuiz {
  position: string;
  stackDepth: string;
  action: string;
  hand: string;
  isIncluded: boolean;
}

interface QuizResult {
  correct: boolean;
  correctAnswer: boolean;
  explanation: string;
}

const POSITIONS = [
  { value: 'utg', label: 'UTG', description: 'Under the Gun' },
  { value: 'mp', label: 'MP', description: 'Middle Position' },
  { value: 'co', label: 'CO', description: 'Cutoff' },
  { value: 'btn', label: 'BTN', description: 'Button' },
  { value: 'sb', label: 'SB', description: 'Small Blind' },
  { value: 'bb', label: 'BB', description: 'Big Blind' },
];

const STACK_DEPTHS = [
  { value: '20bb', label: '20 BB', description: 'Short Stack' },
  { value: '50bb', label: '50 BB', description: 'Medium Stack' },
  { value: '100bb', label: '100 BB', description: 'Standard Stack' },
  { value: '200bb', label: '200 BB', description: 'Deep Stack' },
];

const ACTIONS = [
  { value: 'open', label: 'Open Raise' },
  { value: '3bet', label: '3-Bet' },
  { value: '4bet', label: '4-Bet' },
];

export function RangeTraining() {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStackDepth, setSelectedStackDepth] = useState('');
  const [selectedAction, setSelectedAction] = useState('open');
  const [currentQuiz, setCurrentQuiz] = useState<RangeQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showRange, setShowRange] = useState(false);
  const [rangeData, setRangeData] = useState<string[]>([]);

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (selectedPosition) params.append('position', selectedPosition);
      if (selectedStackDepth) params.append('stackDepth', selectedStackDepth);
      if (selectedAction) params.append('action', selectedAction);

      const response = await fetch(`/api/range/quiz?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCurrentQuiz(data.question);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPosition, selectedStackDepth, selectedAction]);

  const fetchRange = useCallback(async () => {
    if (!selectedPosition || !selectedStackDepth) return;

    try {
      const response = await fetch(
        `/api/range/${selectedPosition}/${selectedStackDepth}?action=${selectedAction}`
      );
      const data = await response.json();

      if (response.ok) {
        setRangeData(data.range);
        setShowRange(true);
      }
    } catch (error) {
      console.error('Failed to fetch range:', error);
    }
  }, [selectedPosition, selectedStackDepth, selectedAction]);

  const handleAnswer = useCallback(async (answer: boolean) => {
    if (!currentQuiz) return;

    const correct = answer === currentQuiz.isIncluded;
    setResult({
      correct,
      correctAnswer: currentQuiz.isIncluded,
      explanation: currentQuiz.isIncluded
        ? `${currentQuiz.hand} IS in the ${currentQuiz.action} range for ${currentQuiz.position} with ${currentQuiz.stackDepth}`
        : `${currentQuiz.hand} is NOT in the ${currentQuiz.action} range for ${currentQuiz.position} with ${currentQuiz.stackDepth}`
    });

    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  }, [currentQuiz]);

  const handleNext = useCallback(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Range Training
          </CardTitle>
          <CardDescription>
            Learn preflop ranges for different positions and stack depths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="All positions" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label} - {pos.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stack Depth</label>
              <Select value={selectedStackDepth} onValueChange={setSelectedStackDepth}>
                <SelectTrigger>
                  <SelectValue placeholder="All depths" />
                </SelectTrigger>
                <SelectContent>
                  {STACK_DEPTHS.map((depth) => (
                    <SelectItem key={depth.value} value={depth.value}>
                      {depth.label} - {depth.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Score: </span>
              <span className="text-green-600">{score.correct}</span>
              <span className="text-muted-foreground"> / </span>
              <span>{score.total}</span>
            </div>
            {score.total > 0 && (
              <Badge variant={score.correct / score.total >= 0.7 ? 'default' : 'destructive'}>
                {Math.round((score.correct / score.total) * 100)}% accuracy
              </Badge>
            )}
          </div>

          {/* Quiz Card */}
          {currentQuiz && (
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Should you {currentQuiz.action} with this hand?
                  </div>
                  <div className="text-4xl font-bold font-mono">
                    {currentQuiz.hand}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{currentQuiz.position}</span>
                    <span className="mx-2">•</span>
                    <span>{currentQuiz.stackDepth}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{currentQuiz.action}</span>
                  </div>

                  {!result ? (
                    <div className="flex justify-center gap-4">
                      <Button
                        size="lg"
                        onClick={() => handleAnswer(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Yes, Raise
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleAnswer(false)}
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        No, Fold
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert variant={result.correct ? 'default' : 'destructive'}>
                        {result.correct ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          {result.correct ? 'Correct!' : 'Wrong!'} {result.explanation}
                        </AlertDescription>
                      </Alert>

                      <Button onClick={handleNext}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Next Hand
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show Range Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={fetchRange}>
              View Full Range Chart
            </Button>
          </div>

          {/* Range Display */}
          {showRange && rangeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedAction.toUpperCase()} Range - {selectedPosition.toUpperCase()} - {selectedStackDepth}
                </CardTitle>
                <CardDescription>
                  {rangeData.length} hands in range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {rangeData.map((hand, index) => (
                    <Badge key={index} variant="secondary" className="font-mono">
                      {hand}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RangeTraining;
