"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { TextInput } from "@/components/molecules/TextInput";
import { LoginFormValues, loginSchema } from "@/schema/auth.validation";
import { useLoginService } from "@/services/auth.service";

export default function LoginPage() {
  const { loginUser, isLoggingIn } = useLoginService();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginUser(values.email, values.password);
  };

  return (
    <section className="flex min-h-dvh w-full items-center justify-center bg-muted p-5">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <TextInput
                  label="Email address"
                  placeholder="you@example.com"
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <TextInput label="Password" type="password" field={field} />
              )}
            />
            <Button loading={isLoggingIn} type="submit" className="mt-4 w-full">
              Sign in
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
