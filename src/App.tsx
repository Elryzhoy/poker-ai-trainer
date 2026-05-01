import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
                <Route path="/hand-history" element={
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Hand History Analysis</h1>
                    <HandHistoryUpload />
                  </div>
                } />
                <Route path="/range" element={
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Range Training</h1>
                    <RangeTraining />
                  </div>
                } />
                <Route path="/review" element={
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Hand Review</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
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
