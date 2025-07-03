import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming shadcn setup

const Navbar = () => {
  return (
    <header className="bg-primary-foreground border-b">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          IntelliVibe
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/jobs">
            <Button variant="ghost">Jobs</Button>
          </Link>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;