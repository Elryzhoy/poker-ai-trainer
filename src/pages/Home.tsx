import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import {
  Brain,
  BarChart3,
  Dumbbell,
  Trophy,
  Shield,
  Zap,
  Crown,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI对手训练',
    description: '与不同难度的AI对手进行实战训练，从新手到职业级别逐步提升',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: '智能复盘分析',
    description: 'AI自动分析你的每一手牌，找出决策漏洞，提供改进建议',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Dumbbell,
    title: '个性化训练',
    description: '根据你的水平和弱点，定制专属训练计划，高效提升',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Trophy,
    title: '成就系统',
    description: '完成挑战获得成就徽章，记录你的成长历程',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '采用银行级加密技术，保护你的数据和隐私安全',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Zap,
    title: '实时反馈',
    description: '每一步决策都有即时的AI评估和建议，加速学习',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
]

const plans = [
  {
    name: '免费版',
    price: '0',
    period: '永久',
    description: '开始你的扑克之旅',
    features: [
      '每日5局AI训练',
      '基础复盘功能',
      '新手教程',
      '社区访问',
    ],
    popular: false,
    buttonText: '免费开始',
    buttonVariant: 'outline' as const,
  },
  {
    name: '专业版',
    price: '99',
    period: '/月',
    description: '认真提升你的技术',
    features: [
      '无限AI训练',
      '高级复盘分析',
      '个性化训练计划',
      '数据统计面板',
      '优先客服支持',
      '去除广告',
    ],
    popular: true,
    buttonText: '立即订阅',
    buttonVariant: 'poker' as const,
  },
  {
    name: '精英版',
    price: '299',
    period: '/月',
    description: '成为职业级玩家',
    features: [
      '所有专业版功能',
      '职业级AI对手',
      '1对1教练指导',
      '赛事模拟训练',
      '高级数据挖掘',
      '专属社区',
      '优先新功能体验',
    ],
    popular: false,
    buttonText: '立即订阅',
    buttonVariant: 'gold' as const,
  },
]

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-poker-green/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="success" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            AI驱动的智能训练
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            用<span className="text-poker-green">AI</span>提升你的
            <br />
            <span className="text-poker-gold">德州扑克</span>技术
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            与最先进的AI对手实战训练，获得专业的复盘分析，
            <br className="hidden md:block" />
            让每一手牌都成为进步的机会
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="xl" variant="poker" onClick={() => navigate('/training')}>
                开始训练
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button size="xl" variant="poker" onClick={() => navigate('/register')}>
                  免费开始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="xl" variant="outline" onClick={() => navigate('/login')}>
                  我已有账号
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { label: '注册用户', value: '10,000+' },
              { label: '训练牌局', value: '1,000,000+' },
              { label: 'AI准确率', value: '99.2%' },
              { label: '用户好评', value: '4.9/5' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-poker-green">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-poker-green/10 hidden lg:block">
          <span className="text-[150px]">♠</span>
        </div>
        <div className="absolute bottom-20 right-10 text-poker-gold/10 hidden lg:block">
          <span className="text-[150px]">♥</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              为什么选择 <span className="text-poker-green">PokerAI</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              我们结合最先进的人工智能技术和专业的扑克教学理念，为你打造最佳的学习体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">三步开始提升</h2>
            <p className="text-muted-foreground text-lg">简单几步，开启你的扑克进阶之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: '注册账号',
                description: '免费注册，30秒即可开始',
              },
              {
                step: '02',
                title: '选择训练',
                description: '根据你的水平选择合适的训练模式',
              },
              {
                step: '03',
                title: '持续进步',
                description: 'AI分析你的表现，持续优化训练方案',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-poker-green text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              选择适合你的方案
            </h2>
            <p className="text-muted-foreground text-lg">
              从免费开始，随时升级解锁更多功能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? 'border-poker-green shadow-lg scale-105'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="success" className="px-4 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      最受欢迎
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">¥{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-poker-green flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.buttonVariant}
                    size="lg"
                    onClick={() => navigate(user ? '/profile' : '/register')}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-poker-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备好提升你的扑克技术了吗？
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            加入超过10,000名玩家，使用AI技术系统性地提升你的德州扑克水平
          </p>
          <Button
            size="xl"
            variant="gold"
            onClick={() => navigate(user ? '/training' : '/register')}
          >
            {user ? '开始训练' : '免费注册'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
