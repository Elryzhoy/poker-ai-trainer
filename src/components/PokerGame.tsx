import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { 
  Loader2, CheckCircle, XCircle, RotateCcw, 
  Play, SkipForward, Coins, 
  ArrowUp
} from 'lucide-react';
import { 
  createGame, getAvailableActions, executeAction, 
  aiDecision, formatCard, getGameStatus,
  POSITIONS, ACTIONS 
} from '@/lib/pokerEngine';
import { saveTrainingResult } from '@/lib/localStorage';

export function PokerGame() {
  const [game, setGame] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [showBetSlider, setShowBetSlider] = useState(false);
  const [gameCount, setGameCount] = useState(0);
  const [results, setResults] = useState({ wins: 0, losses: 0, ties: 0 });

  // 开始新游戏
  const startNewGame = useCallback(() => {
    const newGame = createGame({ small: 1, big: 2 }, 200);
    setGame(newGame);
    setBetAmount(newGame.blinds.big * 2);
    setShowBetSlider(false);
  }, []);

  // 执行玩家动作
  const handleAction = useCallback((action: string, amount?: number) => {
    if (!game || game.isFinished) return;

    let newGame = executeAction(game, action, amount);
    
    // 保存训练结果
    saveTrainingResult({
      questionId: game.id,
      answer: action,
      isCorrect: action !== ACTIONS.FOLD || Math.random() > 0.5,
      weakArea: 'game_play'
    });

    setGame(newGame);
    setShowBetSlider(false);

    // 如果游戏没结束，AI行动
    if (!newGame.isFinished && newGame.currentActor === POSITIONS.VILLAIN) {
      setIsThinking(true);
      setTimeout(() => {
        const aiAction = aiDecision(newGame);
        const afterAiGame = executeAction(newGame, aiAction.action, aiAction.amount);
        setGame(afterAiGame);
        setIsThinking(false);
        
        // 如果游戏结束，更新统计
        if (afterAiGame.isFinished) {
          setGameCount(prev => prev + 1);
          if (afterAiGame.winner === POSITIONS.HERO) {
            setResults(prev => ({ ...prev, wins: prev.wins + 1 }));
          } else if (afterAiGame.winner === POSITIONS.VILLAIN) {
            setResults(prev => ({ ...prev, losses: prev.losses + 1 }));
          } else {
            setResults(prev => ({ ...prev, ties: prev.ties + 1 }));
          }
        }
      }, 1000);
    }
  }, [game]);

  // 获取可用动作
  const availableActions = game ? getAvailableActions(game) : [];

  // 格式化牌面
  const renderCard = (card: string, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-22 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
          ?
        </div>
      );
    }
    
    const { rank, suit, color } = formatCard(card);
    return (
      <div className={`w-16 h-22 bg-white rounded-lg flex flex-col items-center justify-center border-2 
        ${color === 'red' ? 'border-red-300 text-red-600' : 'border-gray-300 text-gray-800'}`}>
        <span className="text-2xl font-bold">{rank}</span>
        <span className="text-xl">{suit}</span>
      </div>
    );
  };

  // 初始化游戏
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  if (!game) {
    return <div>加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">实战对弈</h1>
        <p className="text-muted-foreground">
          与AI对手进行单挑对战，提升你的实战能力
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧统计 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                对战统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{gameCount}</div>
                <div className="text-sm text-muted-foreground">总局数</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                  <div className="text-xl font-bold text-green-600">{results.wins}</div>
                  <div className="text-xs">胜</div>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
                  <div className="text-xl font-bold text-red-600">{results.losses}</div>
                  <div className="text-xs">负</div>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">{results.ties}</div>
                  <div className="text-xs">平</div>
                </div>
              </div>
              {gameCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((results.wins / gameCount) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">胜率</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={startNewGame} className="w-full" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            新一局
          </Button>
        </div>

        {/* 右侧游戏区 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 游戏状态 */}
          <Alert className="text-lg">
            <Play className="h-5 w-5" />
            <AlertDescription>
              {getGameStatus(game)}
            </AlertDescription>
          </Alert>

          {/* 底池 */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-sm text-muted-foreground">底池</div>
              <div className="text-4xl font-bold text-primary">${game.pot}</div>
            </CardContent>
          </Card>

          {/* 公共牌 */}
          {game.communityCards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">公共牌</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-2">
                  {game.communityCards.map((card: string, index: number) => (
                    <div key={index}>{renderCard(card)}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 对手区域 */}
          <Card className={game.currentActor === POSITIONS.VILLAIN ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI对手</CardTitle>
                <Badge variant="outline">${game.villain.stack}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {game.isFinished ? (
                    game.villain.cards.map((card: string, index: number) => (
                      <div key={index}>{renderCard(card)}</div>
                    ))
                  ) : (
                    <>
                      {renderCard('', true)}
                      {renderCard('', true)}
                    </>
                  )}
                </div>
                {game.villain.bet > 0 && (
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    下注: ${game.villain.bet}
                  </Badge>
                )}
                {game.villain.isAllIn && (
                  <Badge variant="destructive" className="text-lg px-4 py-1">
                    ALL IN
                  </Badge>
                )}
                {isThinking && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>思考中...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 玩家区域 */}
          <Card className={game.currentActor === POSITIONS.HERO ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">你的手牌</CardTitle>
                <Badge variant="outline">${game.hero.stack}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-2">
                  {game.hero.cards.map((card: string, index: number) => (
                    <div key={index}>{renderCard(card)}</div>
                  ))}
                </div>
                {game.hero.bet > 0 && (
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    下注: ${game.hero.bet}
                  </Badge>
                )}
                {game.hero.isAllIn && (
                  <Badge variant="destructive" className="text-lg px-4 py-1">
                    ALL IN
                  </Badge>
                )}
              </div>

              {/* 操作按钮 */}
              {!game.isFinished && game.currentActor === POSITIONS.HERO && !isThinking && (
                <div className="space-y-4">
                  {/* 下注滑块 */}
                  {showBetSlider && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">下注金额</span>
                        <span className="text-lg font-bold">${betAmount}</span>
                      </div>
                      <Slider
                        value={[betAmount]}
                        onValueChange={(value) => setBetAmount(value[0])}
                        min={game.blinds.big}
                        max={game.hero.stack}
                        step={game.blinds.big}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${game.blinds.big}</span>
                        <span>${game.hero.stack}</span>
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-2">
                    {availableActions.includes(ACTIONS.FOLD) && (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleAction(ACTIONS.FOLD)}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        弃牌
                      </Button>
                    )}
                    
                    {availableActions.includes(ACTIONS.CHECK) && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleAction(ACTIONS.CHECK)}
                        className="flex-1"
                      >
                        <SkipForward className="mr-2 h-4 w-4" />
                        过牌
                      </Button>
                    )}
                    
                    {availableActions.includes(ACTIONS.CALL) && (
                      <Button 
                        variant="default" 
                        onClick={() => handleAction(ACTIONS.CALL)}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        跟注 ${game.villain.bet - game.hero.bet}
                      </Button>
                    )}
                    
                    {availableActions.includes(ACTIONS.BET) && (
                      <Button 
                        variant="default" 
                        onClick={() => {
                          if (showBetSlider) {
                            handleAction(ACTIONS.BET, betAmount);
                          } else {
                            setShowBetSlider(true);
                            setBetAmount(game.blinds.big * 2);
                          }
                        }}
                        className="flex-1"
                      >
                        <ArrowUp className="mr-2 h-4 w-4" />
                        {showBetSlider ? `下注 $${betAmount}` : '下注'}
                      </Button>
                    )}
                    
                    {availableActions.includes(ACTIONS.RAISE) && (
                      <Button 
                        variant="default" 
                        onClick={() => {
                          if (showBetSlider) {
                            handleAction(ACTIONS.RAISE, betAmount);
                          } else {
                            setShowBetSlider(true);
                            setBetAmount(game.villain.bet * 3);
                          }
                        }}
                        className="flex-1"
                      >
                        <ArrowUp className="mr-2 h-4 w-4" />
                        {showBetSlider ? `加注到 $${betAmount}` : '加注'}
                      </Button>
                    )}
                    
                    {availableActions.includes(ACTIONS.ALL_IN) && (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleAction(ACTIONS.ALL_IN)}
                        className="flex-1"
                      >
                        <Coins className="mr-2 h-4 w-4" />
                        全下 ${game.hero.stack}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* 游戏结束 */}
              {game.isFinished && (
                <div className="space-y-4">
                  <Alert variant={game.winner === POSITIONS.HERO ? 'default' : 'destructive'}>
                    {game.winner === POSITIONS.HERO ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <AlertDescription className="text-lg">
                      {game.winner === POSITIONS.HERO ? '🎉 你赢了！' : 
                       game.winner === POSITIONS.VILLAIN ? '❌ AI赢了！' : '🤝 平局！'}
                      {game.winner === POSITIONS.HERO && ` 赢得 $${game.pot}`}
                    </AlertDescription>
                  </Alert>

                  <Button onClick={startNewGame} size="lg" className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    下一局
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 历史记录 */}
          {game.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">操作记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {game.history.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="w-16 justify-center">
                        {entry.street === 'preflop' ? '翻前' : 
                         entry.street === 'flop' ? '翻牌' :
                         entry.street === 'turn' ? '转牌' : '河牌'}
                      </Badge>
                      <span>{entry.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default PokerGame;
