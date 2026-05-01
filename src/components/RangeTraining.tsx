import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RotateCcw, Target } from 'lucide-react';
import { saveRangeProgress, getRangeProgress } from '@/lib/localStorage';

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
  { value: 'utg', label: 'UTG', description: '枪口位' },
  { value: 'mp', label: 'MP', description: '中间位' },
  { value: 'co', label: 'CO', description: '关煞位' },
  { value: 'btn', label: 'BTN', description: '按钮位' },
  { value: 'sb', label: 'SB', description: '小盲' },
  { value: 'bb', label: 'BB', description: '大盲' },
];

const STACK_DEPTHS = [
  { value: '20bb', label: '20 BB', description: '短码' },
  { value: '50bb', label: '50 BB', description: '中码' },
  { value: '100bb', label: '100 BB', description: '标准码' },
  { value: '200bb', label: '200 BB', description: '深码' },
];

const ACTIONS = [
  { value: 'open', label: '开池加注' },
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
  const [progress, setProgress] = useState<any>({});

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

  const handleAnswer = useCallback((answer: boolean) => {
    if (!currentQuiz) return;

    const correct = answer === currentQuiz.isIncluded;
    
    // 保存到本地存储
    saveRangeProgress(currentQuiz.position, currentQuiz.stackDepth, currentQuiz.action, correct);
    
    setResult({
      correct,
      correctAnswer: currentQuiz.isIncluded,
      explanation: currentQuiz.isIncluded
        ? `${currentQuiz.hand} 在 ${currentQuiz.position} ${currentQuiz.stackDepth} 的 ${currentQuiz.action} 范围内`
        : `${currentQuiz.hand} 不在 ${currentQuiz.position} ${currentQuiz.stackDepth} 的 ${currentQuiz.action} 范围内`
    });

    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // 更新进度
    const updatedProgress = getRangeProgress();
    setProgress(updatedProgress);
  }, [currentQuiz]);

  const handleNext = useCallback(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    fetchQuiz();
    const savedProgress = getRangeProgress();
    setProgress(savedProgress);
  }, [fetchQuiz]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            范围训练
          </CardTitle>
          <CardDescription>
            学习不同位置和筹码深度的翻前范围
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 筛选器 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">位置</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="所有位置" />
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
              <label className="text-sm font-medium">筹码深度</label>
              <Select value={selectedStackDepth} onValueChange={setSelectedStackDepth}>
                <SelectTrigger>
                  <SelectValue placeholder="所有深度" />
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
              <label className="text-sm font-medium">动作</label>
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

          {/* 得分显示 */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="font-medium">得分: </span>
              <span className="text-green-600">{score.correct}</span>
              <span className="text-muted-foreground"> / </span>
              <span>{score.total}</span>
            </div>
            {score.total > 0 && (
              <Badge variant={score.correct / score.total >= 0.7 ? 'default' : 'destructive'}>
                {Math.round((score.correct / score.total) * 100)}% 正确率
              </Badge>
            )}
          </div>

          {/* 测验卡片 */}
          {currentQuiz && (
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-sm text-muted-foreground">
                    这手牌应该 {currentQuiz.action} 吗？
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
                        是，加注
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleAnswer(false)}
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        否，弃牌
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
                          {result.correct ? '正确！' : '错误！'} {result.explanation}
                        </AlertDescription>
                      </Alert>

                      <Button onClick={handleNext}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        下一手
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 显示范围按钮 */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={fetchRange}>
              查看完整范围表
            </Button>
          </div>

          {/* 范围显示 */}
          {showRange && rangeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedAction.toUpperCase()} 范围 - {selectedPosition.toUpperCase()} - {selectedStackDepth}
                </CardTitle>
                <CardDescription>
                  范围内有 {rangeData.length} 手牌
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
