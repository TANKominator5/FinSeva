import DefaultLayout from "@/layouts/default";
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import React from "react";
import {Button, Input, Checkbox, Link, Form, Divider} from "@nextui-org/react";
import {Icon} from "@iconify/react";

export default function LoginPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Basic client-side validation to avoid empty requests
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log the full error to the console for easier debugging of 400s, etc.
        console.error('Supabase signInWithPassword error:', error);
        alert(error.message || 'Unable to sign in. Please check your credentials.');
        return;
      }

      // Optional: log the session/user for debugging
      console.log('Supabase sign-in success:', data);
      router.push('/dashboard');
    } catch (err) {
      console.error('Unexpected error during sign-in:', err);
      alert('Something went wrong while signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    const { error } = await 
    supabase.auth.signInWithOAuth(
      { 
        provider: 'google',
        options: {
          redirectTo: `${window.location.protocol}//${window.location.host}/dashboard`
        }
      })
    if (error) alert(error.message)
  }
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
              <div className="flex flex-col gap-1">
                <h1 className="text-large font-medium">Sign in to your account</h1>
                <p className="text-small text-default-500">to continue to FinSeva</p>
              </div>

              <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
                <Input
                  isRequired
                  label="Email Address"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  variant="bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  isRequired
                  endContent={
                    <button type="button" onClick={toggleVisibility}>
                      {isVisible ? (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-closed-linear"
                        />
                      ) : (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-bold"
                        />
                      )}
                    </button>
                  }
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                  variant="bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex w-full items-center justify-between px-1 py-2">
                  <Checkbox name="remember" size="sm">
                    Remember me
                  </Checkbox>
                  <Link className="text-default-500" href="#" size="sm">
                    Forgot password?
                  </Link>
                </div>
                <Button className="w-full" color="primary" type="submit" isDisabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form>
              <div className="flex items-center gap-4 py-2">
                <Divider className="flex-1" />
                <p className="shrink-0 text-tiny text-default-500">OR</p>
                <Divider className="flex-1" />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  startContent={<Icon icon="flat-color-icons:google" width={24} />}
                  variant="bordered"
                  onPress={handleGoogleLogin}
                >
                  Continue with Google
                </Button>
              </div>
              <p className="text-center text-small">
                Need to create an account?&nbsp;
                <Link href="signup" size="sm">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
