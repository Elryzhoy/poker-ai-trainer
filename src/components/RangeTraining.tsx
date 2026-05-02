import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, RotateCcw, Target, Grid3X3, BookOpen } from 'lucide-react';
import { saveRangeProgress, getRangeProgress } from '@/lib/localStorage';

interface RangeQuiz {
  position: string;
  stackDepth: string;
  action: string;
  hand: string;
  isIncluded: boolean;
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

// 所有起手牌
const ALL_HANDS = [
  'AA', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'AKo', 'KK', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
  'AQo', 'KQo', 'QQ', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
  'AJo', 'KJo', 'QJo', 'JJ', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
  'ATo', 'KTo', 'QTo', 'JTo', 'TT', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
  'A9o', 'K9o', 'Q9o', 'J9o', 'T9o', '99', '98s', '97s', '96s', '95s', '94s', '93s', '92s',
  'A8o', 'K8o', 'Q8o', 'J8o', 'T8o', '98o', '88', '87s', '86s', '85s', '84s', '83s', '82s',
  'A7o', 'K7o', 'Q7o', 'J7o', 'T7o', '97o', '87o', '77', '76s', '75s', '74s', '73s', '72s',
  'A6o', 'K6o', 'Q6o', 'J6o', 'T6o', '96o', '86o', '76o', '66', '65s', '64s', '63s', '62s',
  'A5o', 'K5o', 'Q5o', 'J5o', 'T5o', '95o', '85o', '75o', '65o', '55', '54s', '53s', '52s',
  'A4o', 'K4o', 'Q4o', 'J4o', 'T4o', '94o', '84o', '74o', '64o', '54o', '44', '43s', '42s',
  'A3o', 'K3o', 'Q3o', 'J3o', 'T3o', '93o', '83o', '73o', '63o', '53o', '43o', '33', '32s',
  'A2o', 'K2o', 'Q2o', 'J2o', 'T2o', '92o', '82o', '72o', '62o', '52o', '42o', '32o', '22'
];

export function RangeTraining() {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStackDepth, setSelectedStackDepth] = useState('');
  const [selectedAction, setSelectedAction] = useState('open');
  const [currentQuiz, setCurrentQuiz] = useState<RangeQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [rangeData, setRangeData] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('quiz');

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
      }
    } catch (error) {
      console.error('Failed to fetch range:', error);
    }
  }, [selectedPosition, selectedStackDepth, selectedAction]);

  const handleAnswer = useCallback((answer: boolean) => {
    if (!currentQuiz) return;

    const correct = answer === currentQuiz.isIncluded;
    
    saveRangeProgress(currentQuiz.position, currentQuiz.stackDepth, currentQuiz.action, correct);
    
    setResult({
      correct,
      explanation: currentQuiz.isIncluded
        ? `${currentQuiz.hand} 在 ${currentQuiz.position} ${currentQuiz.stackDepth} 的 ${currentQuiz.action} 范围内`
        : `${currentQuiz.hand} 不在 ${currentQuiz.position} ${currentQuiz.stackDepth} 的 ${currentQuiz.action} 范围内`
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

  useEffect(() => {
    if (selectedPosition && selectedStackDepth) {
      fetchRange();
    }
  }, [selectedPosition, selectedStackDepth, selectedAction, fetchRange]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">范围训练</h1>
        <p className="text-muted-foreground">
          学习不同位置和筹码深度的翻前范围，掌握GTO打法
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            范围测验
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            范围图表
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 左侧控制 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">位置</label>
                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="随机位置" />
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
                        <SelectValue placeholder="随机深度" />
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">得分</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      {score.correct}/{score.total}
                    </div>
                    {score.total > 0 && (
                      <Badge variant={score.correct / score.total >= 0.7 ? 'default' : 'destructive'} className="text-lg px-4 py-1">
                        {Math.round((score.correct / score.total) * 100)}% 正确率
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧测验 */}
            <div className="lg:col-span-2">
              {currentQuiz ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="text-lg text-muted-foreground">
                        这手牌应该 {currentQuiz.action} 吗？
                      </div>
                      <div className="text-6xl font-bold font-mono bg-muted p-6 rounded-lg inline-block">
                        {currentQuiz.hand}
                      </div>
                      <div className="text-lg">
                        <span className="font-medium">{currentQuiz.position}</span>
                        <span className="mx-3 text-muted-foreground">•</span>
                        <span>{currentQuiz.stackDepth}</span>
                        <span className="mx-3 text-muted-foreground">•</span>
                        <span className="capitalize">{currentQuiz.action}</span>
                      </div>

                      {!result ? (
                        <div className="flex justify-center gap-6 pt-4">
                          <Button
                            size="lg"
                            onClick={() => handleAnswer(true)}
                            className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
                          >
                            <CheckCircle className="mr-2 h-6 w-6" />
                            是，加注
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleAnswer(false)}
                            className="px-8 py-6 text-lg"
                          >
                            <XCircle className="mr-2 h-6 w-6" />
                            否，弃牌
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-4">
                          <Alert variant={result.correct ? 'default' : 'destructive'} className="text-lg">
                            {result.correct ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                            <AlertDescription>
                              {result.correct ? '🎉 正确！' : '❌ 错误！'} {result.explanation}
                            </AlertDescription>
                          </Alert>

                          <Button onClick={handleNext} size="lg">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            下一手
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>加载中...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>范围图表</CardTitle>
              <CardDescription>
                选择位置和筹码深度查看完整范围
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">位置</label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择位置" />
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
                      <SelectValue placeholder="选择深度" />
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

              {rangeData.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {selectedAction.toUpperCase()} 范围 - {selectedPosition.toUpperCase()} - {selectedStackDepth}
                    </h3>
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      {rangeData.length} 手牌
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {rangeData.map((hand, index) => (
                      <Badge 
                        key={index} 
                        variant="default" 
                        className="font-mono text-base px-3 py-1"
                      >
                        {hand}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>请选择位置和筹码深度查看范围</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RangeTraining;
