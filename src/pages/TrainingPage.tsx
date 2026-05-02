import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle, RotateCcw, Brain, Target, Zap, BookOpen } from 'lucide-react';
import { saveTrainingResult, getTrainingStats } from '@/lib/localStorage';

interface TrainingQuestion {
  id: string;
  scenario: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  type: string;
  difficulty: string;
}

interface TrainingType {
  id: string;
  name: string;
  description: string;
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
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');

  const fetchStats = useCallback(() => {
    const data = getTrainingStats();
    setStats(data);
  }, []);

  const fetchTrainingTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/training/types');
      const data = await response.json();
      if (response.ok) {
        setTrainingTypes(data.types);
      }
    } catch (error) {
      console.error('Failed to fetch training types:', error);
    }
  }, []);

  const generateQuestions = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: selectedType || undefined,
          count: 10 
        }),
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
  }, [selectedType]);

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    
    // 检查答案
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '').trim();
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(currentQuestion.correctAnswer);
    
    const isCorrect = normalizedUser.includes(normalizedCorrect) || 
                      normalizedCorrect.includes(normalizedUser) ||
                      normalizedUser === normalizedCorrect;
    
    // 保存到本地存储
    saveTrainingResult({
      questionId: currentQuestion.id,
      answer: userAnswer,
      isCorrect,
      weakArea: currentQuestion.type
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

  useEffect(() => {
    fetchStats();
    fetchTrainingTypes();
  }, [fetchStats, fetchTrainingTypes]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI扑克训练</h1>
        <p className="text-muted-foreground">
          提升你的扑克水平，从基础到高级全方位训练
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧统计和选择 */}
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
                    <div className="text-4xl font-bold text-primary">{stats.accuracy}%</div>
                    <div className="text-sm text-muted-foreground">正确率</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{stats.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">总题数</div>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{stats.streak}</div>
                      <div className="text-xs text-muted-foreground">连续正确</div>
                    </div>
                  </div>
                  {stats.weakAreas.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">需要加强</div>
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
                      <div className="text-sm font-medium mb-2">擅长领域</div>
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
                <div className="text-center text-muted-foreground py-4">
                  加载中...
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                训练类型
              </CardTitle>
              <CardDescription>
                选择要训练的内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  {trainingTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedType && (
                <p className="text-xs text-muted-foreground mt-2">
                  {trainingTypes.find(t => t.id === selectedType)?.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={generateQuestions} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
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
        </div>

        {/* 右侧训练区 */}
        <div className="lg:col-span-3 space-y-4">
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    训练题
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentQuestion.type}</Badge>
                    <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 场景描述 */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2 text-primary">场景</div>
                  <p className="text-lg">{currentQuestion.scenario}</p>
                </div>

                {/* 问题 */}
                <div>
                  <div className="text-sm font-medium mb-2 text-primary">问题</div>
                  <p className="text-xl font-medium">{currentQuestion.question}</p>
                </div>

                {/* 答案输入 */}
                {!result && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">你的答案</div>
                    <Textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="输入你的答案..."
                      rows={3}
                      className="text-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={submitAnswer} 
                        disabled={isLoading || !userAnswer.trim()}
                        size="lg"
                      >
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
                  </div>
                )}

                {/* 结果 */}
                {result && (
                  <div className="space-y-4">
                    <Alert variant={result.correct ? 'default' : 'destructive'} className="text-lg">
                      {result.correct ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <AlertDescription>
                        {result.correct ? '🎉 回答正确！' : '❌ 回答错误！'}
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2 text-primary">解释</div>
                      <p className="text-base">{result.explanation}</p>
                    </div>

                    {!result.correct && (
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-sm font-medium mb-2 text-green-700 dark:text-green-300">正确答案</div>
                        <p className="text-lg font-medium text-green-800 dark:text-green-200">
                          {currentQuestion.correctAnswer}
                        </p>
                      </div>
                    )}

                    <Button onClick={nextQuestion} size="lg">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      下一题
                    </Button>
                  </div>
                )}

                {/* 进度 */}
                <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                  第 {questions.findIndex(q => q.id === currentQuestion.id) + 1} 题 / 共 {questions.length} 题
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">准备开始训练？</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  选择训练类型，然后点击"开始训练"按钮。
                  系统会为你生成个性化的训练题。
                </p>
                <Button onClick={generateQuestions} disabled={isGenerating} size="lg">
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
