import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function AdminForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/50 bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Self-service password reset isn't available. Please ask another admin to reset your password for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" variant="outline">
            <Link to="/admin/login" className="inline-flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
