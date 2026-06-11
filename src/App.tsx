import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import TripDetailsPage from "./pages/TripDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import { TripModeProvider } from "./context/TripModeContext";
import { ToastProvider } from "./context/ToastContext";
import CreateTripPage from "./pages/CreateTripPage";
import UserProfilePage from "./pages/UserProfilePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import PersonalDataConsentPage from "./pages/PersonalDataConsentPage";
import CargoTripDetailsPage from "./pages/CargoTripDetailsPage";
import RouteHistoryTracker from "./components/navigation/RouteHistoryTracker";
import SearchResultsPage from "./pages/SearchResultsPage";
import SupportPage from "./pages/SupportPage";

// CSS
import "./styles/home.css";
import "./styles/chats.css";
import "./styles/profile.css";
import "./styles/tripcard.css";
import "./styles/trippage.css";
import "./styles/pageheader.css";
import "./styles/triphistory.css";
import "./styles/personaldata.css";
import "./styles/privacypolicy.css";
import "./styles/user-profile-page.css";
import "./styles/toast.css";
import "./styles/footer.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <TripModeProvider>
          <BrowserRouter>
            <RouteHistoryTracker />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/cargo-trip/:id"
                  element={<CargoTripDetailsPage />}
                />
                <Route path="/trip/:id" element={<TripDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route
                  path="/personal-data-consent"
                  element={<PersonalDataConsentPage />}
                />
                <Route path="/create-trip" element={<CreateTripPage />} />
                <Route path="/trip/:id/edit" element={<CreateTripPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/user/:id" element={<UserProfilePage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TripModeProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
