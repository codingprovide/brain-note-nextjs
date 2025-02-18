import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, signIn, signOut } from "@/auth";
export async function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const session = await auth();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <div className="flex flex-col gap-6">
                <Button variant="outline" className="w-full" type="submit">
                  Sign Out
                </Button>
              </div>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <div className="flex flex-col gap-6">
                <Button variant="outline" className="w-full" type="submit">
                  Login with Google
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
