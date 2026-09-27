import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">
            <span className="text-ok">$</span> cd ./page
          </p>
          <p className="mt-4 font-bold text-6xl tabular-nums text-warn">404</p>
          <p className="mt-3 text-sm text-muted-foreground">
            command not found: this page doesn't exist (exit code 127).
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">back to home</Link>
          </Button>
        </div>
          </div>
    </motion.div>
  );
}
