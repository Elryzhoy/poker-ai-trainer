import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, RotateCcw, Brain, Target, Zap } from 'lucide-react';

interface TrainingQuestion {
  id: string;
  scenario: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  weakArea: string;
}

interface TrainingStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  weakAreas: string[];
  strongAreas: string[];
}

export function TrainingPage() {
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [selectedWeakAreas, setSelectedWeakAreas] = useState<string[]>([]);

  const WEAK_AREAS = [
    { value: 'preflop', label: 'Preflop' },
    { value: 'postflop', label: 'Postflop' },
    { value: 'bet_sizing', label: 'Bet Sizing' },
    { value: 'position', label: 'Position' },
    { value: 'range', label: 'Range' },
    { value: 'bluffing', label: 'Bluffing' },
    { value: 'value_betting', label: 'Value Betting' },
    { value: 'river_play', label: 'River Play' },
  ];

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/training/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const generateQuestions = useCallback(async () => {
    setIsGenerating(true);
    try {
      const weakAreas = selectedWeakAreas.length > 0 
        ? selectedWeakAreas 
        : ['preflop', 'position', 'bet_sizing'];

      const response = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakAreas, count: 10, difficulty: 'medium' }),
      });

      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
        if (data.questions.length > 0) {
          setCurrentQuestion(data.questions[0]);
          setUserAnswer('');
          setResult(null);
        }
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedWeakAreas]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/training/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: userAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult({
          correct: data.isCorrect,
          explanation: data.explanation,
        });
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, userAnswer, fetchStats]);

  const nextQuestion = useCallback(() => {
    const currentIndex = questions.findIndex(q => q.id === currentQuestion?.id);
    if (currentIndex < questions.length - 1) {
      setCurrentQuestion(questions[currentIndex + 1]);
      setUserAnswer('');
      setResult(null);
    } else {
      setCurrentQuestion(null);
    }
  }, [questions, currentQuestion]);

  const toggleWeakArea = (area: string) => {
    setSelectedWeakAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Training</h1>
        <p className="text-muted-foreground">
          Personalized poker training based on your weak areas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{stats.accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold">{stats.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">{stats.streak}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Weak Areas</div>
                    <div className="flex flex-wrap gap-1">
                      {stats.weakAreas.map((area) => (
                        <Badge key={area} variant="destructive" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Strong Areas</div>
                    <div className="flex flex-wrap gap-1">
                      {stats.strongAreas.map((area) => (
                        <Badge key={area} variant="default" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Loading stats...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weak Area Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Focus Areas
              </CardTitle>
              <CardDescription>
                Select areas to focus on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {WEAK_AREAS.map((area) => (
                  <Badge
                    key={area.value}
                    variant={selectedWeakAreas.includes(area.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleWeakArea(area.value)}
                  >
                    {area.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            onClick={generateQuestions} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Training Set
              </>
            )}
          </Button>
        </div>

        {/* Main Training Area */}
        <div className="lg:col-span-2 space-y-4">
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Training Question</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                    <Badge variant="secondary">{currentQuestion.weakArea}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scenario */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Scenario</div>
                  <p>{currentQuestion.scenario}</p>
                </div>

                {/* Question */}
                <div>
                  <div className="text-sm font-medium mb-2">Question</div>
                  <p className="font-medium">{currentQuestion.question}</p>
                </div>

                {/* Answer Input */}
                {!result && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Your Answer</div>
                    <Textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      rows={3}
                    />
                    <Button onClick={submitAnswer} disabled={isLoading || !userAnswer.trim()}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="space-y-4">
                    <Alert variant={result.correct ? 'default' : 'destructive'}>
                      {result.correct ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {result.correct ? 'Correct!' : 'Incorrect!'}
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Explanation</div>
                      <p className="text-sm">{result.explanation}</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Correct Answer</div>
                      <p className="text-sm font-mono">{currentQuestion.correctAnswer}</p>
                    </div>

                    <Button onClick={nextQuestion}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Next Question
                    </Button>
                  </div>
                )}

                {/* Progress */}
                <div className="text-sm text-muted-foreground text-center">
                  Question {questions.findIndex(q => q.id === currentQuestion.id) + 1} of {questions.length}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Ready to Train?</h3>
                <p className="text-muted-foreground mb-4">
                  Select your weak areas and generate a training set to get started.
                </p>
                <Button onClick={generateQuestions} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Training
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainingPage;
