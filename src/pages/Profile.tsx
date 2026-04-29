import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Calendar,
  Crown,
  Trophy,
  Target,
  TrendingUp,
  Gamepad2,
  Clock,
  Star,
  Settings,
  CreditCard,
  Bell,
  Shield,
} from 'lucide-react'

export function Profile() {
  const { user, userProfile } = useAuth()

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const stats = [
    { icon: Gamepad2, label: '总牌局数', value: userProfile?.gamesPlayed || 0, color: 'text-blue-500' },
    { icon: Target, label: '胜率', value: `${userProfile?.winRate || 0}%`, color: 'text-green-500' },
    { icon: TrendingUp, label: '盈利趋势', value: '+12.5%', color: 'text-poker-green' },
    { icon: Clock, label: '训练时长', value: '28小时', color: 'text-purple-500' },
  ]

  const achievements = [
    { icon: '🏆', name: '初出茅庐', description: '完成第一局训练', unlocked: true },
    { icon: '🎯', name: '精准打击', description: '连续10手正确决策', unlocked: true },
    { icon: '💰', name: '筹码大师', description: '单局赢得1000筹码', unlocked: false },
    { icon: '🧠', name: '扑克天才', description: '胜率达到60%', unlocked: false },
    { icon: '⭐', name: '坚持不懈', description: '连续训练7天', unlocked: true },
    { icon: '🔥', name: '热手', description: '连续赢5局', unlocked: false },
  ]

  const subscriptionPlans = [
    { name: '免费版', price: '¥0/月', current: userProfile?.subscription === 'free' },
    { name: '专业版', price: '¥99/月', current: userProfile?.subscription === 'pro' },
    { name: '精英版', price: '¥299/月', current: userProfile?.subscription === 'elite' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userProfile?.photoURL || undefined} />
          <AvatarFallback className="bg-poker-green text-white text-2xl">
            {getInitials(userProfile?.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{userProfile?.displayName || '用户'}</h1>
            <Badge variant={userProfile?.subscription === 'free' ? 'secondary' : 'success'}>
              {userProfile?.subscription === 'free' && '免费版'}
              {userProfile?.subscription === 'pro' && '专业版'}
              {userProfile?.subscription === 'elite' && '精英版'}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {userProfile?.email}
          </p>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            加入于 {new Date(userProfile?.joinDate || '').toLocaleDateString('zh-CN')}
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          编辑资料
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-poker-gold" />
              成就徽章
            </CardTitle>
            <CardDescription>解锁成就展示你的实力</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-muted/50'
                      : 'opacity-50 bg-muted/20'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-poker-gold" />
              订阅管理
            </CardTitle>
            <CardDescription>管理你的订阅方案</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  plan.current ? 'border-poker-green bg-poker-green/5' : ''
                }`}
              >
                <div>
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-sm text-muted-foreground">{plan.price}</div>
                </div>
                {plan.current ? (
                  <Badge variant="success">当前方案</Badge>
                ) : (
                  <Button variant="outline" size="sm">
                    升级
                  </Button>
                )}
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                支付方式
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                通知设置
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                安全设置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近活动
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: '完成了一局训练', time: '2小时前', result: '盈利 +250 筹码', color: 'text-green-500' },
              { action: '解锁新成就', time: '昨天', result: '坚持不懈', color: 'text-poker-gold' },
              { action: '完成了一局训练', time: '昨天', result: '亏损 -120 筹码', color: 'text-red-500' },
              { action: '升级到专业版', time: '3天前', result: '', color: 'text-blue-500' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
                {activity.result && (
                  <span className={`font-medium ${activity.color}`}>
                    {activity.result}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
