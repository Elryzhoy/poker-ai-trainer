import React from 'react'
import { Link } from 'react-router-dom'
import { Spade } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-poker-green flex items-center justify-center">
                <Spade className="h-5 w-5 text-poker-gold" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-poker-green">Poker</span>
                <span className="text-poker-gold">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              使用最先进的人工智能技术，帮助你成为更好的德州扑克玩家。
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">产品</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/training" className="hover:text-foreground transition-colors">AI训练</Link></li>
              <li><Link to="/review" className="hover:text-foreground transition-colors">智能复盘</Link></li>
              <li><Link to="/leaderboard" className="hover:text-foreground transition-colors">排行榜</Link></li>
              <li><Link to="/learn" className="hover:text-foreground transition-colors">学习资源</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">支持</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">帮助中心</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">联系我们</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">反馈建议</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">常见问题</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">法律</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">服务条款</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">隐私政策</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie政策</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 PokerAI Pro. 保留所有权利。</p>
          <p className="mt-2">
            本平台仅供学习和娱乐，请遵守当地法律法规。理性游戏，享受过程。
          </p>
        </div>
      </div>
    </footer>
  )
}
