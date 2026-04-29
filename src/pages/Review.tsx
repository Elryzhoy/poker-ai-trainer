import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  ChevronRight,
} from 'lucide-react'

const reviewStats = {
  totalHands: 156,
  winRate: 56.4,
  avgProfit: '+125',
  biggestWin: '+1,250',
  biggestLoss: '-680',
  vpip: 28.5,
  pfr: 22.1,
  af: 2.8,
}

const aiInsights = [
  {
    type: 'improvement',
    icon: AlertTriangle,
    title: '翻牌前加注范围过宽',
    description: '在枪口位置你有32%的入池率，建议收紧到18-22%',
    severity: 'high',
  },
  {
    type: 'improvement',
    icon: AlertTriangle,
    title: '河牌圈弃牌率过高',
    description: '面对下注时弃牌率达到72%，可能错过了价值下注机会',
    severity: 'medium',
  },
  {
    type: 'strength',
    icon: CheckCircle,
    title: '位置意识良好',
    description: '你在按钮位的盈利明显高于其他位置，继续保持',
    severity: 'low',
  },
  {
    type: 'strength',
    icon: CheckCircle,
    title: '持续下注执行出色',
    description: '翻牌圈持续下注率达到68%，频率合理',
    severity: 'low',
  },
]

const recentHands = [
  {
    id: 1,
    date: '今天 14:32',
    hand: 'A♠ K♥',
    position: 'BTN',
    action: '加注 → 跟注 → 全押',
    result: '+580',
    aiRating: 92,
    tags: ['AA vs KK', '翻牌前全押'],
  },
  {
    id: 2,
    date: '今天 14:15',
    hand: 'Q♦ Q♣',
    position: 'CO',
    action: '加注 → 跟注3bet → 过牌',
    result: '-120',
    aiRating: 45,
    tags: ['错过价值', '转牌过早放弃'],
  },
  {
    id: 3,
    date: '今天 13:58',
    hand: 'J♠ T♠',
    position: 'BB',
    action: '跟注 → 过牌 → 加注',
    result: '+320',
    aiRating: 78,
    tags: ['同花听牌', '半诈唬'],
  },
  {
    id: 4,
    date: '昨天 20:45',
    hand: '7♥ 7♦',
    position: 'MP',
    action: '加注 → 弃牌',
    result: '-30',
    aiRating: 88,
    tags: ['口袋对子', '正确弃牌'],
  },
  {
    id: 5,
    date: '昨天 20:30',
    hand: 'A♣ K♣',
    position: 'SB',
    action: '加注 → 4bet → 全押',
    result: '+1200',
    aiRating: 95,
    tags: ['顶级起手牌', '翻牌前全押'],
  },
]

const profitData = [
  { day: '周一', profit: 320 },
  { day: '周二', profit: -150 },
  { day: '周三', profit: 480 },
  { day: '周四', profit: 220 },
  { day: '周五', profit: -80 },
  { day: '周六', profit: 650 },
  { day: '周日', profit: 380 },
]

export function Review() {
  const maxProfit = Math.max(...profitData.map((d) => Math.abs(d.profit)))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">复盘分析</h1>
          <p className="text-muted-foreground">
            AI智能分析你的每一手牌，找出提升空间
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '总手数', value: reviewStats.totalHands, icon: BarChart3 },
          { label: '胜率', value: `${reviewStats.winRate}%`, icon: TrendingUp },
          { label: '平均盈利', value: reviewStats.avgProfit, icon: TrendingUp },
          { label: '最大单手盈利', value: reviewStats.biggestWin, icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profit chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>本周盈亏趋势</CardTitle>
            <CardDescription>每日盈亏变化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {profitData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-md ${
                      day.profit >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      height: `${(Math.abs(day.profit) / maxProfit) * 100}%`,
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                盈利
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                亏损
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key metrics */}
        <Card>
          <CardHeader>
            <CardTitle>关键指标</CardTitle>
            <CardDescription>你的核心数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'VPIP (自愿入池率)', value: `${reviewStats.vpip}%`, target: '22-28%', status: 'good' },
              { label: 'PFR (翻牌前加注率)', value: `${reviewStats.pfr}%`, target: '18-24%', status: 'good' },
              { label: 'AF (激进因子)', value: reviewStats.af.toString(), target: '2.0-3.5', status: 'good' },
              { label: '最大单手亏损', value: reviewStats.biggestLoss, target: '', status: 'warning' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">{metric.label}</div>
                  {metric.target && (
                    <div className="text-xs text-muted-foreground">目标: {metric.target}</div>
                  )}
                </div>
                <Badge variant={metric.status === 'good' ? 'success' : 'warning'}>
                  {metric.value}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-poker-green" />
            AI分析洞察
          </CardTitle>
          <CardDescription>基于你的数据，AI给出的改进建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'improvement'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-green-500/5 border-green-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${
                    insight.type === 'improvement' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    <insight.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">{insight.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {insight.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent hands */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>最近手牌</CardTitle>
              <CardDescription>点击查看详细分析</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              查看全部
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentHands.map((hand) => (
              <div
                key={hand.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{hand.hand}</div>
                    <div className="text-xs text-muted-foreground">{hand.position}</div>
                  </div>
                  <div>
                    <div className="font-medium">{hand.action}</div>
                    <div className="flex gap-2 mt-1">
                      {hand.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    hand.result.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {hand.result}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Brain className="h-3 w-3 text-poker-green" />
                    <span className="text-sm text-muted-foreground">
                      AI评分: {hand.aiRating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
