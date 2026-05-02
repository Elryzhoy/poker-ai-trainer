import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { TrainingPage } from '@/pages/TrainingPage';
import { HandHistoryUpload } from '@/components/HandHistoryUpload';
import { RangeTraining } from '@/components/RangeTraining';
import { PokerGame } from '@/components/PokerGame';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="poker-ai-theme">
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/game" element={<PokerGame />} />
                <Route path="/hand-history" element={
                  <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold mb-2">手牌历史分析</h1>
                      <p className="text-muted-foreground">
                        上传你的手牌记录，AI会分析你的打法并提供改进建议
                      </p>
                    </div>
                    <HandHistoryUpload />
                  </div>
                } />
                <Route path="/range" element={<RangeTraining />} />
                <Route path="/review" element={
                  <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold mb-2">手牌复盘</h1>
                      <p className="text-muted-foreground">
                        复盘你的关键手牌，学习最优打法
                      </p>
                    </div>
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">即将推出...</p>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
