
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrainTrack } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-railway-50 to-white dark:from-railway-950 dark:to-gray-900 p-4">
      <div className="text-center max-w-md w-full p-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in">
        <TrainTrack className="h-16 w-16 mx-auto text-railway-600 dark:text-railway-400 mb-4" />
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Seems like you've gone off the tracks!
        </p>
        <Link to="/">
          <Button className="bg-railway-600 hover:bg-railway-700">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
