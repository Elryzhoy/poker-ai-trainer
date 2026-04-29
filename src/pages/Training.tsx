import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Users,
  Target,
  Zap,
  Trophy,
  Clock,
  ArrowRight,
  Star,
} from 'lucide-react'

const trainingModes = [
  {
    icon: Brain,
    title: 'AI单挑训练',
    description: '与AI进行1对1的单挑训练，专注于翻牌后的决策能力',
    difficulty: '初级',
    duration: '15-30分钟',
    color: 'bg-blue-500/10 text-blue-500',
    badge: 'badge-success',
  },
  {
    icon: Users,
    title: '多人桌训练',
    description: '模拟真实多人桌环境，训练位置意识和多人底池策略',
    difficulty: '中级',
    duration: '30-60分钟',
    color: 'bg-green-500/10 text-green-500',
    badge: 'badge-warning',
  },
  {
    icon: Target,
    title: '锦标赛模拟',
    description: '模拟锦标赛环境，训练不同阶段的策略调整',
    difficulty: '高级',
    duration: '60-120分钟',
    color: 'bg-purple-500/10 text-purple-500',
    badge: 'badge-destructive',
  },
  {
    icon: Zap,
    title: '快速训练',
    description: '5分钟快速训练，利用碎片时间保持手感',
    difficulty: '全等级',
    duration: '5分钟',
    color: 'bg-yellow-500/10 text-yellow-500',
    badge: 'badge-secondary',
  },
  {
    icon: Trophy,
    title: '挑战模式',
    description: '完成特定挑战任务，获得成就和奖励',
    difficulty: '挑战',
    duration: '可变',
    color: 'bg-orange-500/10 text-orange-500',
    badge: 'badge-warning',
  },
  {
    icon: Star,
    title: '自定义训练',
    description: '自定义训练参数，针对特定场景进行专项训练',
    difficulty: '自定义',
    duration: '自定义',
    color: 'bg-poker-green/10 text-poker-green',
    badge: 'badge-success',
  },
]

const recentSessions = [
  { opponent: 'AI-初级', result: '胜', chips: '+320', time: '25分钟', date: '今天' },
  { opponent: 'AI-中级', result: '负', chips: '-150', time: '42分钟', date: '今天' },
  { opponent: 'AI-初级', result: '胜', chips: '+180', time: '18分钟', date: '昨天' },
  { opponent: 'AI-高级', result: '负', chips: '-500', time: '65分钟', date: '昨天' },
]

export function Training() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">训练中心</h1>
        <p className="text-muted-foreground">
          选择适合你的训练模式，开始提升你的扑克技术
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '今日训练', value: '2局', icon: Clock },
          { label: '本周胜率', value: '58%', icon: Target },
          { label: '连胜纪录', value: '3局', icon: Trophy },
          { label: '总训练时长', value: '28小时', icon: Star },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-poker-green/10 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-poker-green" />
              </div>
              <div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training modes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">选择训练模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingModes.map((mode) => (
            <Card key={mode.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${mode.color} flex items-center justify-center`}>
                    <mode.icon className="h-6 w-6" />
                  </div>
                  <Badge variant={
                    mode.difficulty === '初级' ? 'success' :
                    mode.difficulty === '中级' ? 'warning' :
                    mode.difficulty === '高级' ? 'destructive' :
                    'secondary'
                  }>
                    {mode.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{mode.title}</CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {mode.duration}
                  </div>
                  <Button variant="ghost" size="sm" className="group-hover:text-poker-green">
                    开始
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <CardTitle>最近训练记录</CardTitle>
          <CardDescription>查看你最近的训练表现</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    session.result === '胜' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {session.result === '胜' ? (
                      <Trophy className="h-5 w-5 text-green-500" />
                    ) : (
                      <Target className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{session.opponent}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.date} · {session.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    session.result === '胜' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {session.chips}
                  </div>
                  <Badge variant={session.result === '胜' ? 'success' : 'destructive'} className="mt-1">
                    {session.result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
