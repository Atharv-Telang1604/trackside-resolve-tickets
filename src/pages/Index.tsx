
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrainFront } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";

const Index = () => {
  const { currentUser } = useAuth();

  // Redirect logic based on user role
  const getDashboardUrl = () => {
    if (!currentUser) return "/login";
    return currentUser.role === "admin" ? "/admin" : "/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-railway-50 to-white dark:from-railway-950 dark:to-gray-900">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 animate-fade-in">
          <TrainFront size={64} className="mx-auto text-railway-600 dark:text-railway-400" />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Railway Resolve
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Helping you travel better.
          </p>
        </div>

        <div className="max-w-md w-full space-y-8 p-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome to our Complaint Management Portal
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your feedback helps us improve railway services for everyone.
            </p>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            {currentUser ? (
              <Link to={getDashboardUrl()}>
                <Button size="lg" className="w-full bg-railway-600 hover:bg-railway-700">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login-customer">
                  <Button size="lg" className="w-full bg-railway-600 hover:bg-railway-700">
                    Customer Login / Register
                  </Button>
                </Link>
                <Link to="/login-admin">
                  <Button size="lg" variant="outline" className="w-full">
                    Admin Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="w-full py-6 px-4 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Railway Resolve
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
