import { useState } from "react";

const LoginCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-[420px] p-8">
        <div className="text-center mb-7">
          <h1 className="text-[22px] font-bold text-card-foreground">
            Login to CleanStreet
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Login to your account to get started!
          </p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Don't have an account?{" "}
          <a href="#" className="text-primary font-semibold underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;