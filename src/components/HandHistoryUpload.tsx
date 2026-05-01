import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { saveHandHistory, getHandStats } from '@/lib/localStorage';

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
  const [stats, setStats] = useState<any>(null);

  const handleUpload = useCallback(async () => {
    if (!handHistory.trim()) {
      setError('请粘贴你的手牌记录');
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
        throw new Error(data.error || '解析手牌失败');
      }

      setParsedHands(data.hands);
      
      // 保存到本地存储
      saveHandHistory(data.hands);
      
      // 获取统计
      const handStats = getHandStats();
      setStats(handStats);
      
      setSuccess(`成功解析 ${data.handCount} 手牌`);
    } catch (err: any) {
      setError(err.message || '解析手牌失败');
    } finally {
      setIsUploading(false);
    }
  }, [handHistory, platform]);

  const handleAnalyze = useCallback(async () => {
    if (parsedHands.length === 0) {
      setError('请先上传手牌记录');
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
        throw new Error(data.error || '分析失败');
      }

      setAnalysisResults(data.analyses);
      setSuccess(`分析完成！使用了 ${data.tokensUsed} 个Token`);
    } catch (err: any) {
      setError(err.message || '分析失败');
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
            上传手牌记录
          </CardTitle>
          <CardDescription>
            从支持的扑克平台粘贴你的手牌记录
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 平台选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">平台（可选）</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="自动检测平台" />
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

          {/* 手牌输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">手牌记录</label>
            <Textarea
              placeholder="在这里粘贴你的手牌记录..."
              value={handHistory}
              onChange={(e) => setHandHistory(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  解析手牌
                </>
              )}
            </Button>

            {parsedHands.length > 0 && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="secondary">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  'AI分析'
                )}
              </Button>
            )}
          </div>

          {/* 状态消息 */}
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

      {/* 统计卡片 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>你的统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalHands}</div>
                <div className="text-sm text-muted-foreground">总手数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <div className="text-sm text-muted-foreground">总会话数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${stats.biggestWin}</div>
                <div className="text-sm text-muted-foreground">最大赢利</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">${stats.biggestLoss}</div>
                <div className="text-sm text-muted-foreground">最大亏损</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 解析结果 */}
      {parsedHands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>解析结果 ({parsedHands.length} 手)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsedHands.slice(0, 5).map((hand, index) => (
                <div key={hand.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-mono text-sm">手牌 #{hand.id}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ${hand.smallBlind}/${hand.bigBlind}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {hand.seats.length} 位玩家
                  </Badge>
                </div>
              ))}
              {parsedHands.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  ... 还有 {parsedHands.length - 5} 手
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析结果 */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI分析结果</CardTitle>
            <CardDescription>
              分析了 {analysisResults.length} 手
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResults.map((result, index) => (
                <div key={result.handId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">手牌 #{result.handId}</span>
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
