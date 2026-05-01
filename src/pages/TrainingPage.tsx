import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, RotateCcw, Brain, Target, Zap } from 'lucide-react';
import { saveTrainingResult, getTrainingStats } from '@/lib/localStorage';

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
    { value: 'preflop', label: '翻前' },
    { value: 'postflop', label: '翻后' },
    { value: 'bet_sizing', label: '下注大小' },
    { value: 'position', label: '位置' },
    { value: 'range', label: '范围' },
    { value: 'bluffing', label: '诈唬' },
    { value: 'value_betting', label: '价值下注' },
    { value: 'river_play', label: '河牌' },
  ];

  const fetchStats = useCallback(() => {
    const data = getTrainingStats();
    setStats(data);
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

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    
    // 检查答案（简单字符串匹配）
    const isCorrect = userAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase()) ||
                      currentQuestion.correctAnswer.toLowerCase().includes(userAnswer.toLowerCase());
    
    // 保存到本地存储
    saveTrainingResult({
      questionId: currentQuestion.id,
      answer: userAnswer,
      isCorrect,
      weakArea: currentQuestion.weakArea
    });

    setResult({
      correct: isCorrect,
      explanation: currentQuestion.explanation
    });

    fetchStats();
    setIsLoading(false);
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
        <h1 className="text-3xl font-bold mb-2">AI训练</h1>
        <p className="text-muted-foreground">
          基于你的弱项进行个性化扑克训练
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧统计 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                你的统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{stats.accuracy}%</div>
                    <div className="text-sm text-muted-foreground">正确率</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold">{stats.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">总题数</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">{stats.streak}</div>
                      <div className="text-xs text-muted-foreground">连续正确</div>
                    </div>
                  </div>
                  {stats.weakAreas.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">弱项</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.weakAreas.map((area) => (
                          <Badge key={area} variant="destructive" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.strongAreas.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">强项</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.strongAreas.map((area) => (
                          <Badge key={area} variant="default" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  加载中...
                </div>
              )}
            </CardContent>
          </Card>

          {/* 弱项选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                训练重点
              </CardTitle>
              <CardDescription>
                选择要重点训练的方面
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

          {/* 生成按钮 */}
          <Button 
            onClick={generateQuestions} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                生成训练题
              </>
            )}
          </Button>
        </div>

        {/* 右侧训练区 */}
        <div className="lg:col-span-2 space-y-4">
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>训练题</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                    <Badge variant="secondary">{currentQuestion.weakArea}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 场景描述 */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">场景</div>
                  <p>{currentQuestion.scenario}</p>
                </div>

                {/* 问题 */}
                <div>
                  <div className="text-sm font-medium mb-2">问题</div>
                  <p className="font-medium">{currentQuestion.question}</p>
                </div>

                {/* 答案输入 */}
                {!result && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">你的答案</div>
                    <Textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="输入你的答案..."
                      rows={3}
                    />
                    <Button onClick={submitAnswer} disabled={isLoading || !userAnswer.trim()}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          检查中...
                        </>
                      ) : (
                        '提交答案'
                      )}
                    </Button>
                  </div>
                )}

                {/* 结果 */}
                {result && (
                  <div className="space-y-4">
                    <Alert variant={result.correct ? 'default' : 'destructive'}>
                      {result.correct ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {result.correct ? '回答正确！' : '回答错误！'}
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">解释</div>
                      <p className="text-sm">{result.explanation}</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">正确答案</div>
                      <p className="text-sm font-mono">{currentQuestion.correctAnswer}</p>
                    </div>

                    <Button onClick={nextQuestion}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      下一题
                    </Button>
                  </div>
                )}

                {/* 进度 */}
                <div className="text-sm text-muted-foreground text-center">
                  第 {questions.findIndex(q => q.id === currentQuestion.id) + 1} 题 / 共 {questions.length} 题
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">准备开始训练？</h3>
                <p className="text-muted-foreground mb-4">
                  选择你的弱项，然后点击"生成训练题"开始。
                </p>
                <Button onClick={generateQuestions} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      开始训练
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
